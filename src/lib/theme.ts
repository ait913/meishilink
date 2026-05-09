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

export interface Palette {
  key: string;
  label: string;
  bg: string;
  fg: string;
  subFg: string;
  border: string;
  accent: string;
}

export interface Theme {
  key: ThemeKey;
  label: string;
  layout: "stacked" | "split" | "card" | "vertical";
  palettes: Palette[];
}

const themes: Record<ThemeKey, Theme> = {
  minimal: {
    key: "minimal",
    label: "ミニマル",
    layout: "stacked",
    palettes: [
      { key: "white", label: "ホワイト", bg: "#ffffff", fg: "#111111", subFg: "#666666", border: "#e5e7eb", accent: "#111111" },
      { key: "cream", label: "クリーム", bg: "#faf6ee", fg: "#1d1a14", subFg: "#7a715f", border: "#e9e0c8", accent: "#7c5a23" },
      { key: "ash", label: "アッシュ", bg: "#f1f3f5", fg: "#1f2937", subFg: "#6b7280", border: "#cbd5e1", accent: "#0f172a" },
      { key: "sand", label: "サンド", bg: "#f5e9d8", fg: "#3a2812", subFg: "#8a715b", border: "#dac4a3", accent: "#a0522d" },
    ],
  },
  mono: {
    key: "mono",
    label: "モノクロ",
    layout: "split",
    palettes: [
      { key: "black", label: "ブラック", bg: "#0b0b0b", fg: "#fafafa", subFg: "#a1a1aa", border: "#27272a", accent: "#fafafa" },
      { key: "graphite", label: "グラファイト", bg: "#1c1c20", fg: "#e7e7eb", subFg: "#9aa0a6", border: "#3a3a3f", accent: "#cbd5e1" },
      { key: "paper", label: "ペーパー", bg: "#1a1a1a", fg: "#f5f0e1", subFg: "#a09680", border: "#3a3a3a", accent: "#d4af37" },
    ],
  },
  warm: {
    key: "warm",
    label: "ウォーム",
    layout: "card",
    palettes: [
      { key: "terra", label: "テラコッタ", bg: "#fff8f1", fg: "#3a2a1a", subFg: "#8b6f4e", border: "#eaddc7", accent: "#c2410c" },
      { key: "amber", label: "アンバー", bg: "#fff6e6", fg: "#3b2a05", subFg: "#94774f", border: "#f0dca0", accent: "#d97706" },
      { key: "olive", label: "オリーブ", bg: "#f4f1e3", fg: "#1f2a0a", subFg: "#6b7257", border: "#cfd5b1", accent: "#65a30d" },
      { key: "rose", label: "ローズ", bg: "#fff3f0", fg: "#3b1a14", subFg: "#9d6b62", border: "#f5c8bd", accent: "#dc2626" },
    ],
  },
  navy: {
    key: "navy",
    label: "ネイビー",
    layout: "split",
    palettes: [
      { key: "deep", label: "ディープ", bg: "#0f172a", fg: "#f8fafc", subFg: "#94a3b8", border: "#1e293b", accent: "#38bdf8" },
      { key: "royal", label: "ロイヤル", bg: "#1e3a8a", fg: "#eff6ff", subFg: "#bfdbfe", border: "#3b82f6", accent: "#fbbf24" },
      { key: "midnight", label: "ミッドナイト", bg: "#020617", fg: "#e2e8f0", subFg: "#64748b", border: "#1e293b", accent: "#22d3ee" },
      { key: "indigo", label: "インディゴ", bg: "#1e1b4b", fg: "#f5f3ff", subFg: "#a5b4fc", border: "#4338ca", accent: "#f472b6" },
    ],
  },
  sakura: {
    key: "sakura",
    label: "さくら",
    layout: "card",
    palettes: [
      { key: "blush", label: "ブラッシュ", bg: "#fff5f7", fg: "#4a1d2a", subFg: "#a36a7d", border: "#f9d0d8", accent: "#db2777" },
      { key: "peach", label: "ピーチ", bg: "#fff1ec", fg: "#4a2014", subFg: "#a37468", border: "#fbd2c4", accent: "#ea580c" },
      { key: "lilac", label: "ライラック", bg: "#f5f3ff", fg: "#3b1d4a", subFg: "#9a8eb0", border: "#ddd6fe", accent: "#7c3aed" },
    ],
  },
  mincho: {
    key: "mincho",
    label: "縦書き明朝",
    layout: "vertical",
    palettes: [
      { key: "kotenshu", label: "古典朱", bg: "#fbf9f3", fg: "#1c1410", subFg: "#5a4a3e", border: "#d8cfb5", accent: "#7f1d1d" },
      { key: "akane", label: "茜", bg: "#fdf2f1", fg: "#2a0e10", subFg: "#7a4a4f", border: "#e7c9c8", accent: "#9a1f2a" },
      { key: "tetsukon", label: "鉄紺", bg: "#1f2632", fg: "#f3eee0", subFg: "#9aa3b3", border: "#3a4255", accent: "#d97706" },
      { key: "moegi", label: "萌葱", bg: "#f3f4ea", fg: "#0e2014", subFg: "#5a705e", border: "#cfd8b8", accent: "#15803d" },
    ],
  },
  washi: {
    key: "washi",
    label: "和紙",
    layout: "vertical",
    palettes: [
      { key: "kinari", label: "生成り", bg: "#f3ece0", fg: "#2a1f12", subFg: "#6b5a3f", border: "#c8b894", accent: "#92400e" },
      { key: "uguisu", label: "鶯", bg: "#ebe8d4", fg: "#1f2611", subFg: "#5d6541", border: "#bcc28d", accent: "#4d7c0f" },
      { key: "benibai", label: "紅梅", bg: "#f4e3df", fg: "#2a141a", subFg: "#85525a", border: "#d6b8ba", accent: "#a91452" },
    ],
  },
  letterpress: {
    key: "letterpress",
    label: "レタープレス",
    layout: "stacked",
    palettes: [
      { key: "kraft", label: "クラフト", bg: "#efe8dc", fg: "#1a1a1a", subFg: "#666666", border: "#a89e89", accent: "#1a1a1a" },
      { key: "cream", label: "クリーム", bg: "#f9f1de", fg: "#1c1208", subFg: "#7d6a4d", border: "#cfb98a", accent: "#6b3a1a" },
      { key: "charcoal", label: "チャコール", bg: "#2c2c2c", fg: "#f1ece0", subFg: "#9a9180", border: "#4a4a4a", accent: "#d4af37" },
      { key: "sage", label: "セージ", bg: "#e8eee2", fg: "#1a2614", subFg: "#67745f", border: "#a8b88f", accent: "#3f6d3a" },
    ],
  },
  engineer: {
    key: "engineer",
    label: "エンジニア",
    layout: "stacked",
    palettes: [
      { key: "catppuccin", label: "Catppuccin", bg: "#0a0a0f", fg: "#cdd6f4", subFg: "#6c7086", border: "#1e1e2e", accent: "#89b4fa" },
      { key: "tokyo-night", label: "Tokyo Night", bg: "#1a1b26", fg: "#c0caf5", subFg: "#565f89", border: "#414868", accent: "#7aa2f7" },
      { key: "nord", label: "Nord", bg: "#2e3440", fg: "#eceff4", subFg: "#81a1c1", border: "#3b4252", accent: "#88c0d0" },
      { key: "dracula", label: "Dracula", bg: "#282a36", fg: "#f8f8f2", subFg: "#6272a4", border: "#44475a", accent: "#bd93f9" },
      { key: "solarized", label: "Solarized", bg: "#fdf6e3", fg: "#073642", subFg: "#586e75", border: "#eee8d5", accent: "#268bd2" },
    ],
  },
};

export const THEMES = themes;

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
  return themes[(themeKey as ThemeKey) in themes ? (themeKey as ThemeKey) : "minimal"];
}

export function getPalette(themeKey: string, paletteKey?: string | null): Palette {
  const theme = getTheme(themeKey);
  if (paletteKey) {
    const hit = theme.palettes.find((p) => p.key === paletteKey);
    if (hit) return hit;
  }
  return theme.palettes[0];
}

export function getFontStack(fontKey: string): string {
  return FONT_STACKS[(fontKey as FontKey) in FONT_STACKS ? (fontKey as FontKey) : "sans"];
}
