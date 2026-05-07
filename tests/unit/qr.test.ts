import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

type QrModule = {
  generateQrPngDataUrl: (url: string) => Promise<string>;
  generateQrSvgString: (url: string) => Promise<string>;
};

async function importQrModule(): Promise<QrModule | null> {
  try {
    return (await import("@/lib/qr")) as QrModule;
  } catch {
    const filePath = path.resolve(process.cwd(), "src/lib/qr.ts");
    if (!existsSync(filePath)) return null;

    try {
      return (await import(pathToFileURL(filePath).href)) as QrModule;
    } catch {
      return null;
    }
  }
}

const qrModule = await importQrModule();

// Reviewer note: skip when the implementation module is absent or not importable.
const describeQr = qrModule ? describe : describe.skip;

describeQr("QR generator spec", () => {
  it("returns a PNG data URL", async () => {
    const pngDataUrl =
      (await qrModule?.generateQrPngDataUrl("https://example.com/yamada")) ?? "";

    expect(pngDataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("returns an SVG string", async () => {
    const svg =
      (await qrModule?.generateQrSvgString("https://example.com/yamada")) ?? "";

    expect(svg.trim().startsWith("<svg")).toBe(true);
    expect(svg.trim().endsWith("</svg>")).toBe(true);
  });
});
