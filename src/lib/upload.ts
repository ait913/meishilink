import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MIME_TO_EXT: Record<string, "png" | "jpg" | "webp"> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function getUploadDir(): string {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "./storage/uploads");
}

export function getLogoExtension(mimeType: string): "png" | "jpg" | "webp" | null {
  return MIME_TO_EXT[mimeType] ?? null;
}

export async function saveLogo(userId: string, file: File): Promise<string> {
  const ext = getLogoExtension(file.type);
  if (!ext) {
    throw new Error("unsupported mime");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > 2 * 1024 * 1024) {
    throw new Error("too large");
  }

  const userDir = path.join(getUploadDir(), userId);
  await mkdir(userDir, { recursive: true });

  const fileName = `logo.${ext}`;
  await writeFile(path.join(userDir, fileName), buffer);

  return `/uploads/${userId}/${fileName}`;
}
