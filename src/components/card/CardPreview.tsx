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
    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/30 bg-white/10">
      <Image alt={`${card.lastName}${card.firstName} のロゴ`} className="object-cover" fill sizes="48px" src={card.logoPath} unoptimized />
    </div>
  ) : (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-current/30 text-[9px] uppercase tracking-[0.2em] text-current/60">
      Logo
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

  const inner = (() => {
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
  })();

  return <div className="mx-auto w-full max-w-[20rem]">{inner}</div>;
}
