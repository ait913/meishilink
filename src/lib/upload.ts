import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";

const MIME_TO_EXT: Record<string, "png" | "jpg" | "webp"> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MAX_BYTES = 2 * 1024 * 1024;

export function getUploadDir(): string {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "./storage/uploads");
}

export function getLogoExtension(mimeType: string): "png" | "jpg" | "webp" | null {
  return MIME_TO_EXT[mimeType] ?? null;
}

/** 先頭バイトから実画像形式を判定 (MIME 詐称対策) */
function sniffImageMime(buf: Buffer): "image/png" | "image/jpeg" | "image/webp" | null {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return "image/png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 12 &&
    buf.slice(0, 4).toString("ascii") === "RIFF" &&
    buf.slice(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function saveLogo(userId: string, file: File): Promise<string> {
  // size early-check (Buffer 化前にサイズで弾く: DoS 抑止)
  if (typeof file.size === "number" && file.size > MAX_BYTES) {
    throw new Error("too large");
  }

  const declaredExt = getLogoExtension(file.type);
  if (!declaredExt) {
    throw new Error("unsupported mime");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error("too large");
  }

  // magic bytes verification — declared MIME と実体が一致しなければ拒否
  const sniffed = sniffImageMime(buffer);
  if (!sniffed || sniffed !== file.type) {
    throw new Error("unsupported mime");
  }
  const ext = MIME_TO_EXT[sniffed];

  const userDir = path.join(getUploadDir(), userId);
  await mkdir(userDir, { recursive: true });

  // 同一ユーザーの古い logo.* を全部削除 (ext 違いの残留対策)
  try {
    const files = await readdir(userDir);
    await Promise.all(
      files
        .filter((f) => /^logo\.(png|jpg|jpeg|webp)$/i.test(f))
        .map((f) => unlink(path.join(userDir, f)).catch(() => undefined)),
    );
  } catch {
    // dir 未存在等は mkdir で作ったので通常無視可能
  }

  const fileName = `logo.${ext}`;
  await writeFile(path.join(userDir, fileName), buffer);

  return `/uploads/${userId}/${fileName}`;
}
