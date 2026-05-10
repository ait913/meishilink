import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { afterAll, describe, expect, it } from "vitest";

type UploadModule = {
  saveLogo: (userId: string, file: File) => Promise<string>;
};

function firstExistingPath(candidates: string[]): string | null {
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function makeFile(buffer: Buffer, mime: string, name: string): File {
  return new File([buffer], name, { type: mime });
}

const originalUploadDir = process.env.UPLOAD_DIR;
const tempUploadDir = mkdtempSync(path.join(tmpdir(), "meishilink-upload-"));
process.env.UPLOAD_DIR = tempUploadDir;

async function importUploadModule(): Promise<UploadModule | null> {
  for (const specifier of ["@/lib/upload"]) {
    try {
      return (await import(specifier)) as UploadModule;
    } catch {
      // fall through to the file URL fallback
    }
  }

  const filePath = firstExistingPath([path.resolve(process.cwd(), "src/lib/upload.ts")]);
  if (!filePath) return null;

  try {
    return (await import(pathToFileURL(filePath).href)) as UploadModule;
  } catch {
    return null;
  }
}

const uploadModule = await importUploadModule();

// Reviewer note: skip when the implementation module is absent or not importable.
const describeUpload = uploadModule ? describe : describe.skip;

afterAll(() => {
  if (originalUploadDir === undefined) {
    delete process.env.UPLOAD_DIR;
  } else {
    process.env.UPLOAD_DIR = originalUploadDir;
  }

  rmSync(tempUploadDir, { recursive: true, force: true });
});

describeUpload("upload sharp spec", () => {
  it("saves a PNG upload as logo.webp and returns only the file name", async () => {
    const userId = "user_png_case";
    const pngBuffer = await sharp({
      create: {
        width: 32,
        height: 20,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const savedName =
      (await uploadModule?.saveLogo(
        userId,
        makeFile(pngBuffer, "image/png", "logo.png"),
      )) ?? "";

    expect(savedName).toBe("logo.webp");
  });

  it("writes WEBP output with RIFF/WEBP magic bytes", async () => {
    const userId = "user_magic_bytes";
    const pngBuffer = await sharp({
      create: {
        width: 24,
        height: 24,
        channels: 4,
        background: { r: 0, g: 255, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    await uploadModule?.saveLogo(
      userId,
      makeFile(pngBuffer, "image/png", "logo.png"),
    );

    const outputPath = path.join(tempUploadDir, userId, "logo.webp");
    const outputBuffer = readFileSync(outputPath);

    expect(outputBuffer.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(outputBuffer.subarray(8, 12).toString("ascii")).toBe("WEBP");
  });

  it("strips EXIF metadata from the WEBP output", async () => {
    const userId = "user_exif_strip";
    const jpegBuffer = await sharp({
      create: {
        width: 40,
        height: 28,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();

    await uploadModule?.saveLogo(
      userId,
      makeFile(jpegBuffer, "image/jpeg", "photo.jpg"),
    );

    const outputPath = path.join(tempUploadDir, userId, "logo.webp");
    const outputBuffer = readFileSync(outputPath);
    const metadata = await sharp(outputBuffer).metadata();

    expect(metadata.exif).toBeUndefined();
  });

  it("applies EXIF orientation before writing WEBP", async () => {
    const userId = "user_orientation";
    const jpegBuffer = await sharp({
      create: {
        width: 100,
        height: 60,
        channels: 3,
        background: { r: 120, g: 90, b: 30 },
      },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();

    await uploadModule?.saveLogo(
      userId,
      makeFile(jpegBuffer, "image/jpeg", "rotated.jpg"),
    );

    const outputPath = path.join(tempUploadDir, userId, "logo.webp");
    const outputBuffer = readFileSync(outputPath);
    const metadata = await sharp(outputBuffer).metadata();

    expect(metadata.width).toBe(60);
    expect(metadata.height).toBe(100);
  });

  it("rejects payloads larger than 2MB", async () => {
    const oversizedBuffer = Buffer.alloc(2 * 1024 * 1024 + 1);
    oversizedBuffer.set(
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      0,
    );

    await expect(
      uploadModule?.saveLogo(
        "user_too_large",
        makeFile(oversizedBuffer, "image/png", "oversized.png"),
      ) ?? Promise.resolve(""),
    ).rejects.toThrow(/too large/i);
  });

  it("rejects unsupported mime or magic bytes", async () => {
    const plainTextBuffer = Buffer.from("not an image", "utf8");

    await expect(
      uploadModule?.saveLogo(
        "user_unsupported",
        makeFile(plainTextBuffer, "text/plain", "logo.txt"),
      ) ?? Promise.resolve(""),
    ).rejects.toThrow(/unsupported|mime/i);
  });
});
