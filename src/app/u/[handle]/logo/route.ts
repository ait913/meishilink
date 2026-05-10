import { readFile } from "fs/promises";
import path from "path";
import { permanentRedirect } from "next/navigation";

import { resolvePublicCard } from "@/lib/exchange-token";
import { normalizeHandle } from "@/lib/handle";
import { getUploadDir } from "@/lib/upload";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ handle: string }> },
): Promise<Response> {
  const { handle: raw } = await params;
  const normalized = normalizeHandle(raw);
  if (!normalized) {
    return new Response("Not Found", { status: 404 });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  const card = await resolvePublicCard(normalized, token);
  if (!card) {
    return new Response("Not Found", { status: 404 });
  }

  if (raw !== normalized) {
    permanentRedirect(`/u/${normalized}/logo${url.search}`);
  }

  if (!card.logoPath || !/^logo\.(webp|png|jpg|jpeg)$/i.test(card.logoPath)) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const filePath = path.join(getUploadDir(), card.userId, card.logoPath);
    const buffer = await readFile(filePath);
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[path.extname(card.logoPath)] ?? "application/octet-stream",
        "Cache-Control": card.isPrivate
          ? "private, no-store, no-cache, must-revalidate"
          : "public, max-age=3600, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
