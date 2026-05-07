import { cookies } from "next/headers";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStatsForCard } from "@/lib/stats";

export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  void cookieStore;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const card = await prisma.card.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!card) {
    return Response.json({ error: "card not found, do onboarding" }, { status: 404 });
  }

  return Response.json(await getStatsForCard(card.id));
}

