import type { CSSProperties, ReactNode } from "react";

import type { PreviewProps } from "@/components/card/CardPreview";

export function SakuraCard({
  card,
  compact = false,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  return (
    <article className={`card-surface relative flex w-full flex-col gap-4 overflow-hidden rounded-[2rem] border p-5 ${compact ? "aspect-[91/55] text-[11px]" : "min-h-[24rem]"}`} style={style}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(219,39,119,0.15),transparent_45%)]" />
      <div className="relative flex items-start gap-4">
        {logo}
        <div className="space-y-1">
          <h2 className={`${compact ? "text-lg" : "text-3xl"} font-semibold`}>{card.lastName} {card.firstName}</h2>
          {card.lastNameKana || card.firstNameKana ? <p className="text-xs text-current/55">{[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}</p> : null}
          {card.company ? <p className="font-medium">{card.company}</p> : null}
          {card.department || card.jobTitle ? <p className="text-current/65">{[card.department, card.jobTitle].filter(Boolean).join(" / ")}</p> : null}
        </div>
      </div>
      <div className="relative rounded-[1.5rem] border border-current/10 bg-white/40 p-4">
        <div className="grid gap-2">
          {card.phone ? <p>{card.phone}</p> : null}
          {card.email ? <p className="break-all">{card.email}</p> : null}
          {card.websiteUrl ? <p className="break-all" style={{ color: "var(--accent)" }}>{card.websiteUrl}</p> : null}
          {card.address ? <p className="text-current/65">{[card.postalCode, card.address].filter(Boolean).join(" ")}</p> : null}
        </div>
      </div>
      <div className="relative mt-auto text-xs text-current/55">@{card.handle}</div>
    </article>
  );
}
