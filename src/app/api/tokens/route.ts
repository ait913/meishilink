import { z } from "zod";

import { auth } from "@/auth";
import { generateTokenString } from "@/lib/exchange-token";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const DEFAULT_TTL_DAYS = 7;
const DEFAULT_TTL_MS = DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000;

async function resolveCardId(session: { user?: { id?: string | null } } | null) {
  const claimed = session?.user?.id ?? null;
  if (!claimed) return null;
  const userHit = await prisma.user.findUnique({ where: { id: claimed }, select: { id: true } });
  if (!userHit) return null;
  const card = await prisma.card.findUnique({ where: { userId: userHit.id }, select: { id: true } });
  return card?.id ?? null;
}

const CreateTokenSchema = z.object({
  label: z.string().max(40).regex(/^[^\r\n]*$/, "改行は使えません").optional().or(z.literal("")),
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

  // 1 cardId あたり 5 分間に 20 件まで発行
  if (!rateLimit(`token-issue:${cardId}`, { limit: 20, windowMs: 5 * 60_000 })) {
    return Response.json({ error: "too many requests" }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = CreateTokenSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid", fields: parsed.error.issues }, { status: 400 });
  }

  const expiresAt = parsed.data.expiresAt
    ? new Date(parsed.data.expiresAt)
    : new Date(Date.now() + DEFAULT_TTL_MS);

  const created = await prisma.exchangeToken.create({
    data: {
      cardId,
      token: generateTokenString(),
      label: parsed.data.label || null,
      expiresAt,
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
