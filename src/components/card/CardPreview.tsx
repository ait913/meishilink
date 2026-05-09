"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

import { getFontStack, getTheme } from "@/lib/theme";
import type { PublicCardViewModel } from "@/components/card/types";
import { MinimalCard } from "@/components/card/MinimalCard";
import { MonoCard } from "@/components/card/MonoCard";
import { NavyCard } from "@/components/card/NavyCard";
import { SakuraCard } from "@/components/card/SakuraCard";
import { WarmCard } from "@/components/card/WarmCard";

export type PreviewProps = {
  card: PublicCardViewModel;
  compact?: boolean;
};

export function CardPreview({ card, compact = false }: PreviewProps) {
  const theme = getTheme(card.themeKey);
  const logo = card.logoPath ? (
    <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-black/10 bg-white/70">
      <Image alt={`${card.lastName}${card.firstName} のロゴ`} className="object-cover" fill sizes="56px" src={card.logoPath} unoptimized />
    </div>
  ) : (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-black/20 text-[10px] text-current/50">
      LOGO
    </div>
  );

  const common = {
    card,
    compact,
    logo,
    style: {
      backgroundColor: theme.bg,
      borderColor: theme.border,
      color: theme.fg,
      fontFamily: getFontStack(card.fontKey),
      "--accent": card.accentColor || theme.accentDefault,
    } as CSSProperties,
    theme,
  };

  switch (card.themeKey) {
    case "mono":
      return <MonoCard {...common} />;
    case "warm":
      return <WarmCard {...common} />;
    case "navy":
      return <NavyCard {...common} />;
    case "sakura":
      return <SakuraCard {...common} />;
    default:
      return <MinimalCard {...common} />;
  }
}
