import { z } from "zod";

import { auth } from "@/auth";
import { generateTokenString } from "@/lib/exchange-token";
import { prisma } from "@/lib/prisma";

async function resolveCardId(session: { user?: { id?: string | null; email?: string | null } } | null) {
  const claimed = session?.user?.id ?? null;
  if (claimed) {
    const userHit = await prisma.user.findUnique({ where: { id: claimed }, select: { id: true } });
    if (userHit) {
      const card = await prisma.card.findUnique({ where: { userId: userHit.id }, select: { id: true } });
      return card?.id ?? null;
    }
  }
  const email = session?.user?.email ?? null;
  if (!email) return null;
  const userByEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!userByEmail) return null;
  const card = await prisma.card.findUnique({ where: { userId: userByEmail.id }, select: { id: true } });
  return card?.id ?? null;
}

const CreateTokenSchema = z.object({
  label: z.string().max(40).optional().or(z.literal("")),
  expiresAt: z.string().datetime().optional().or(z.literal("")),
});

export async function GET(): Promise<Response> {
  const session = await auth();
  const cardId = await resolveCardId(session);
  if (!cardId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const tokens = await prisma.exchangeToken.findMany({
    where: { cardId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      token: true,
      label: true,
      expiresAt: true,
      disabled: true,
      usageCount: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });
  return Response.json({ tokens });
}

export async function POST(req: Request): Promise<Response> {
  const session = await auth();
  const cardId = await resolveCardId(session);
  if (!cardId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = CreateTokenSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid", fields: parsed.error.issues }, { status: 400 });
  }

  const created = await prisma.exchangeToken.create({
    data: {
      cardId,
      token: generateTokenString(),
      label: parsed.data.label || null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
    select: {
      id: true,
      token: true,
      label: true,
      expiresAt: true,
      disabled: true,
      usageCount: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });
  return Response.json(created, { status: 201 });
}
