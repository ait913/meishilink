import { headers } from "next/headers";

import { classifyUA, getCountry } from "@/lib/log";
import { normalizeHandle } from "@/lib/handle";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

/** Referer から token などのクエリ・フラグメントを除去 (origin + path のみ残す) */
function sanitizeReferer(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return `${u.origin}${u.pathname}`.slice(0, 200);
  } catch {
    return null;
  }
}

export async function POST(req: Request): Promise<Response> {
  const headerList = await headers();
  const ip =
    headerList.get("cf-connecting-ip") ??
    headerList.get("x-real-ip") ??
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (!rateLimit(`visit:${ip}`, { limit: 60, windowMs: 60_000 })) {
    return new Response(null, { status: 204 });
  }

  const payload = (await req.json().catch(() => ({ handle: "" }))) as { handle?: string };
  const handle = normalizeHandle(String(payload.handle ?? ""));

  // 公開かつ非プライベートのカードのみ統計対象
  const card = await prisma.card.findFirst({
    where: { handle, isPublished: true, isPrivate: false },
    select: { id: true },
  });
  if (!card) {
    return new Response(null, { status: 204 });
  }

  const uaClass = classifyUA(headerList.get("user-agent"));
  if (uaClass === "bot") {
    return new Response(null, { status: 204 });
  }

  try {
    await prisma.hit.create({
      data: {
        cardId: card.id,
        referer: sanitizeReferer(headerList.get("referer")),
        uaClass,
        country: getCountry(),
      },
    });
  } catch {
    return new Response(null, { status: 204 });
  }

  return new Response(null, { status: 204 });
}
