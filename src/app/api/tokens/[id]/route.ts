import { auth } from "@/auth";
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
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
