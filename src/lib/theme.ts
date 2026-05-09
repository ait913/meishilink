export type ThemeKey = "minimal" | "mono" | "warm" | "navy" | "sakura";
export type FontKey = "sans" | "serif" | "mincho" | "gothic" | "round";

export interface Theme {
  key: ThemeKey;
  label: string;
  bg: string;
  fg: string;
  subFg: string;
  border: string;
  accentDefault: string;
  layout: "stacked" | "split" | "card";
}

export const THEMES: Record<ThemeKey, Theme> = {
  minimal: {
    key: "minimal",
    label: "ミニマル",
    bg: "#ffffff",
    fg: "#111111",
    subFg: "#666666",
    border: "#e5e7eb",
    accentDefault: "#111111",
    layout: "stacked",
  },
  mono: {
    key: "mono",
    label: "モノクロ",
    bg: "#0b0b0b",
    fg: "#fafafa",
    subFg: "#a1a1aa",
    border: "#27272a",
    accentDefault: "#fafafa",
    layout: "split",
  },
  warm: {
    key: "warm",
    label: "ウォーム",
    bg: "#fff8f1",
    fg: "#3a2a1a",
    subFg: "#8b6f4e",
    border: "#eaddc7",
    accentDefault: "#c2410c",
    layout: "card",
  },
  navy: {
    key: "navy",
    label: "ネイビー",
    bg: "#0f172a",
    fg: "#f8fafc",
    subFg: "#94a3b8",
    border: "#1e293b",
    accentDefault: "#38bdf8",
    layout: "split",
  },
  sakura: {
    key: "sakura",
    label: "さくら",
    bg: "#fff5f7",
    fg: "#4a1d2a",
    subFg: "#a36a7d",
    border: "#f9d0d8",
    accentDefault: "#db2777",
    layout: "card",
  },
};

export const FONT_STACKS: Record<FontKey, string> = {
  sans: 'system-ui, -apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
  serif: '"Hiragino Mincho ProN", "Yu Mincho", "Times New Roman", serif',
  mincho: '"Hiragino Mincho ProN", "Yu Mincho", serif',
  gothic: '"Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
  round: '"Hiragino Maru Gothic ProN", "M PLUS Rounded 1c", system-ui, sans-serif',
};

export function getTheme(themeKey: string) {
  return THEMES[(themeKey as ThemeKey) in THEMES ? (themeKey as ThemeKey) : "minimal"];
}

export function getFontStack(fontKey: string) {
  return FONT_STACKS[(fontKey as FontKey) in FONT_STACKS ? (fontKey as FontKey) : "sans"];
}

