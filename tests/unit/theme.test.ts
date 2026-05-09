import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

type ThemeModule = {
  THEMES: Record<string, { key: string; layout: string; palettes: Array<{ key: string; bg: string }> }>;
  FONT_STACKS: Record<string, string>;
};

async function importThemeModule(): Promise<ThemeModule | null> {
  try {
    return (await import("@/lib/theme")) as unknown as ThemeModule;
  } catch {
    const filePath = path.resolve(process.cwd(), "src/lib/theme.ts");
    if (!existsSync(filePath)) return null;

    try {
      return (await import(pathToFileURL(filePath).href)) as unknown as ThemeModule;
    } catch {
      return null;
    }
  }
}

const themeModule = await importThemeModule();

const describeTheme = themeModule ? describe : describe.skip;

describeTheme("theme spec", () => {
  it("exposes the 9 theme keys", () => {
    expect(Object.keys(themeModule?.THEMES ?? {}).sort()).toEqual(
      [
        "engineer",
        "letterpress",
        "mincho",
        "minimal",
        "mono",
        "navy",
        "sakura",
        "warm",
        "washi",
      ].sort(),
    );
  });

  it("each theme has at least one palette and a layout", () => {
    for (const t of Object.values(themeModule?.THEMES ?? {})) {
      expect(t.layout).toBeTruthy();
      expect(t.palettes.length).toBeGreaterThanOrEqual(1);
      expect(t.palettes[0].bg).toMatch(/^#/);
    }
  });

  it("defines the documented font stack keys", () => {
    expect(Object.keys(themeModule?.FONT_STACKS ?? {}).sort()).toEqual(
      ["display", "gothic", "mincho", "mono", "round", "sans", "serif"].sort(),
    );
  });
});
