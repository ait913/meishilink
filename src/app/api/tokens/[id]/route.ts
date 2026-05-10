import { auth } from "@/auth";
import { isAllowedOrigin } from "@/lib/origin-check";
import { prisma } from "@/lib/prisma";

async function resolveCardId(session: { user?: { id?: string | null } } | null) {
  const claimed = session?.user?.id ?? null;
  if (!claimed) return null;
  const userHit = await prisma.user.findUnique({ where: { id: claimed }, select: { id: true } });
  if (!userHit) return null;
  const card = await prisma.card.findUnique({ where: { userId: userHit.id }, select: { id: true } });
  return card?.id ?? null;
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!isAllowedOrigin(req)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const session = await auth();
  const cardId = await resolveCardId(session);
  if (!cardId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const target = await prisma.exchangeToken.findUnique({
    where: { id },
    select: { id: true, cardId: true },
  });
  if (!target || target.cardId !== cardId) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  await prisma.exchangeToken.update({
    where: { id },
    data: { disabled: true },
  });
  return Response.json({ ok: true });
}
