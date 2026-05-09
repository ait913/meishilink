import { headers } from "next/headers";

import { classifyUA, getCountry } from "@/lib/log";
import { normalizeHandle } from "@/lib/handle";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request): Promise<Response> {
  const headerList = await headers();
  const payload = (await req.json().catch(() => ({ handle: "" }))) as { handle?: string };
  const handle = normalizeHandle(String(payload.handle ?? ""));

  const card = await prisma.card.findFirst({
    where: { handle, isPublished: true },
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
        referer: headerList.get("referer")?.slice(0, 200) ?? null,
        uaClass,
        country: getCountry(),
      },
    });
  } catch {
    return new Response(null, { status: 204 });
  }

  return new Response(null, { status: 204 });
}

