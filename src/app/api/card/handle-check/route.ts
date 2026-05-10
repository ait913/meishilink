import { auth } from "@/auth";
import { isReservedHandle, isValidHandle, normalizeHandle } from "@/lib/handle";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request): Promise<Response> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`handle-check:${userId}`, { limit: 30, windowMs: 60_000 })) {
    return Response.json({ error: "too many requests" }, { status: 429 });
  }

  const url = new URL(req.url);
  const input = url.searchParams.get("h");
  if (!input) {
    return Response.json({ error: "missing h" }, { status: 400 });
  }

  const normalized = normalizeHandle(input);
  if (!normalized) {
    return Response.json({
      input,
      normalized,
      valid: false,
      reserved: false,
      available: false,
      reason: "empty after normalize",
    });
  }

  if (!isValidHandle(normalized)) {
    return Response.json({
      input,
      normalized,
      valid: false,
      reserved: false,
      available: false,
      reason: "format",
    });
  }

  if (isReservedHandle(normalized)) {
    return Response.json({
      input,
      normalized,
      valid: true,
      reserved: true,
      available: false,
    });
  }

  const existing = await prisma.card.findUnique({
    where: { handle: normalized },
    select: { id: true },
  });

  return Response.json({
    input,
    normalized,
    valid: true,
    reserved: false,
    available: !existing,
  });
}
