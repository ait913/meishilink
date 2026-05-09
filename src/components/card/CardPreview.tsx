"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";

import { getFontStack, getPalette, getTheme } from "@/lib/theme";
import type { PublicCardViewModel } from "@/components/card/types";
import { EngineerCard } from "@/components/card/EngineerCard";
import { LetterpressCard } from "@/components/card/LetterpressCard";
import { MinchoCard } from "@/components/card/MinchoCard";
import { MinimalCard } from "@/components/card/MinimalCard";
import { MonoCard } from "@/components/card/MonoCard";
import { NavyCard } from "@/components/card/NavyCard";
import { SakuraCard } from "@/components/card/SakuraCard";
import { WarmCard } from "@/components/card/WarmCard";
import { WashiCard } from "@/components/card/WashiCard";

export type PreviewProps = {
  card: PublicCardViewModel;
  compact?: boolean;
};

export function CardPreview({ card, compact = false }: PreviewProps) {
  const theme = getTheme(card.themeKey);
  const palette = getPalette(card.themeKey, card.paletteKey);
  const logo: ReactNode = card.logoPath ? (
    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/30 bg-white/10">
      <Image alt={card.fullName} className="object-cover" fill sizes="48px" src={card.logoPath} unoptimized />
    </div>
  ) : null;

  const common = {
    card,
    compact,
    logo,
    style: {
      backgroundColor: palette.bg,
      borderColor: palette.border,
      color: palette.fg,
      fontFamily: getFontStack(card.fontKey),
      "--accent": card.accentColor || palette.accent,
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
      case "mincho":
        return <MinchoCard {...common} />;
      case "washi":
        return <WashiCard {...common} />;
      case "letterpress":
        return <LetterpressCard {...common} />;
      case "engineer":
        return <EngineerCard {...common} />;
      default:
        return <MinimalCard {...common} />;
    }
  })();

  return <div className="mx-auto w-full max-w-[20rem]">{inner}</div>;
}
