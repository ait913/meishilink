export type ThemeKey =
  | "minimal"
  | "mono"
  | "warm"
  | "navy"
  | "sakura"
  | "mincho"
  | "washi"
  | "letterpress"
  | "engineer";

export type FontKey = "sans" | "serif" | "mincho" | "gothic" | "round" | "display" | "mono";

export interface Theme {
  key: ThemeKey;
  label: string;
  bg: string;
  fg: string;
  subFg: string;
  border: string;
  accentDefault: string;
  layout: "stacked" | "split" | "card" | "vertical";
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
  mincho: {
    key: "mincho",
    label: "縦書き明朝",
    bg: "#fbf9f3",
    fg: "#1c1410",
    subFg: "#5a4a3e",
    border: "#d8cfb5",
    accentDefault: "#7f1d1d",
    layout: "vertical",
  },
  washi: {
    key: "washi",
    label: "和紙",
    bg: "#f3ece0",
    fg: "#2a1f12",
    subFg: "#6b5a3f",
    border: "#c8b894",
    accentDefault: "#92400e",
    layout: "vertical",
  },
  letterpress: {
    key: "letterpress",
    label: "レタープレス",
    bg: "#efe8dc",
    fg: "#1a1a1a",
    subFg: "#666666",
    border: "#a89e89",
    accentDefault: "#1a1a1a",
    layout: "stacked",
  },
  engineer: {
    key: "engineer",
    label: "エンジニア",
    bg: "#0a0a0f",
    fg: "#cdd6f4",
    subFg: "#6c7086",
    border: "#1e1e2e",
    accentDefault: "#89b4fa",
    layout: "stacked",
  },
};

export const FONT_STACKS: Record<FontKey, string> = {
  sans: 'system-ui, -apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
  serif: '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif',
  mincho: '"Shippori Mincho", "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif',
  gothic: '"Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
  round: '"Klee One", "Hiragino Maru Gothic ProN", "M PLUS Rounded 1c", system-ui, sans-serif',
  display: '"Cormorant Garamond", "Shippori Mincho", "Hiragino Mincho ProN", serif',
  mono: '"JetBrains Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
};

export function getTheme(themeKey: string): Theme {
  return THEMES[(themeKey as ThemeKey) in THEMES ? (themeKey as ThemeKey) : "minimal"];
}

export function getFontStack(fontKey: string): string {
  return FONT_STACKS[(fontKey as FontKey) in FONT_STACKS ? (fontKey as FontKey) : "sans"];
}
