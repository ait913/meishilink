import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";

import { auth } from "@/auth";
import { isReservedHandle, isValidHandle, normalizeHandle } from "@/lib/handle";
import { prisma } from "@/lib/prisma";
import { CardInputSchema } from "@/lib/zod-schemas";

function emptyToNull(value?: string | null) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeInput(input: Record<string, unknown>) {
  return {
    ...input,
    lastNameKana: emptyToNull(input.lastNameKana as string | null | undefined),
    firstNameKana: emptyToNull(input.firstNameKana as string | null | undefined),
    company: emptyToNull(input.company as string | null | undefined),
    department: emptyToNull(input.department as string | null | undefined),
    jobTitle: emptyToNull(input.jobTitle as string | null | undefined),
    phone: emptyToNull(input.phone as string | null | undefined),
    email: emptyToNull(input.email as string | null | undefined),
    postalCode: emptyToNull(input.postalCode as string | null | undefined),
    address: emptyToNull(input.address as string | null | undefined),
    websiteUrl: emptyToNull(input.websiteUrl as string | null | undefined),
    poem: emptyToNull(input.poem as string | null | undefined),
    profile: emptyToNull(input.profile as string | null | undefined),
  };
}

export async function POST(req: Request): Promise<Response> {
  const cookieStore = await cookies();
  void cookieStore;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const existingCard = await prisma.card.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (existingCard) {
    return Response.json({ error: "card already exists" }, { status: 403 });
  }

  const payload = (await req.json()) as Record<string, unknown>;
  const rawHandle = String(payload.handle ?? "");
  const normalized = normalizeHandle(rawHandle);
  if (!normalized || !isValidHandle(normalized)) {
    return Response.json({ error: "invalid", fields: [{ path: ["handle"], message: "format" }] }, { status: 400 });
  }
  if (isReservedHandle(normalized)) {
    return Response.json({ error: "handle taken" }, { status: 409 });
  }

  const parsed = CardInputSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "invalid", fields: parsed.error.issues }, { status: 400 });
  }

  try {
    const card = await prisma.card.create({
      data: sanitizeInput({
        ...parsed.data,
        handle: normalized,
        userId: session.user.id,
        snsLinks: parsed.data.snsLinks && parsed.data.snsLinks.length > 0 ? JSON.stringify(parsed.data.snsLinks) : null,
      }) as Prisma.CardUncheckedCreateInput,
      select: { id: true, handle: true },
    });
    return Response.json(card, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "handle taken" }, { status: 409 });
    }
    return Response.json({ error: "create failed" }, { status: 500 });
  }
}

export async function PUT(req: Request): Promise<Response> {
  const cookieStore = await cookies();
  void cookieStore;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const parsed = CardInputSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "invalid", fields: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.card.findUnique({
    where: { userId: session.user.id },
    select: { id: true, handle: true },
  });
  if (!existing) {
    return Response.json({ error: "card not found, do onboarding" }, { status: 404 });
  }

  const updated = await prisma.card.update({
    where: { userId: session.user.id },
    data: sanitizeInput({
      ...parsed.data,
      snsLinks: parsed.data.snsLinks && parsed.data.snsLinks.length > 0 ? JSON.stringify(parsed.data.snsLinks) : null,
    }),
    select: {
      id: true,
      handle: true,
      updatedAt: true,
    },
  });

  return Response.json(updated);
}
