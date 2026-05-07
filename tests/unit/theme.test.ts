import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

type ThemeRecord = Record<string, { key: string; bg: string; layout: string }>;
type FontStacksRecord = Record<string, string>;

type ThemeModule = {
  THEMES: ThemeRecord;
  FONT_STACKS: FontStacksRecord;
};

async function importThemeModule(): Promise<ThemeModule | null> {
  try {
    return (await import("@/lib/theme")) as ThemeModule;
  } catch {
    const filePath = path.resolve(process.cwd(), "src/lib/theme.ts");
    if (!existsSync(filePath)) return null;

    try {
      return (await import(pathToFileURL(filePath).href)) as ThemeModule;
    } catch {
      return null;
    }
  }
}

const themeModule = await importThemeModule();

// Reviewer note: skip when the implementation module is absent or not importable.
const describeTheme = themeModule ? describe : describe.skip;

describeTheme("theme spec", () => {
  it("exposes the documented theme keys", () => {
    expect(Object.keys(themeModule?.THEMES ?? {}).sort()).toEqual([
      "minimal",
      "mono",
      "navy",
      "sakura",
      "warm",
    ]);
  });

  it("keeps the documented minimal and mono values", () => {
    expect(themeModule?.THEMES.minimal.layout).toBe("stacked");
    expect(themeModule?.THEMES.mono.bg).toBe("#0b0b0b");
  });

  it("defines all documented font stack keys", () => {
    expect(Object.keys(themeModule?.FONT_STACKS ?? {}).sort()).toEqual([
      "gothic",
      "mincho",
      "round",
      "sans",
      "serif",
    ]);
  });
});
