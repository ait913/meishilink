import { readFile } from "fs/promises";
import path from "path";

import { cookies } from "next/headers";

import { getUploadDir } from "@/lib/upload";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const cookieStore = await cookies();
  void cookieStore;
  const { path: segments } = await params;
  const root = getUploadDir();
  const target = path.resolve(root, ...segments);
  if (!target.startsWith(root)) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const buffer = await readFile(target);
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[path.extname(target)] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
