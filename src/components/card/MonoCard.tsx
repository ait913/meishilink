import type { CSSProperties, ReactNode } from "react";

import type { PreviewProps } from "@/components/card/CardPreview";

export function MonoCard({
  card,
  compact = false,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  return (
    <article className={`card-surface grid w-full gap-4 rounded-[2rem] border p-5 ${compact ? "aspect-[91/55] grid-cols-[1fr] text-[10px]" : "min-h-[24rem] grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"}`} style={style}>
      <div className="flex flex-col justify-between gap-4 border-b border-current/10 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-4">
        <div className="space-y-2">
          {logo}
          <p className="text-xs uppercase tracking-[0.32em] text-current/55">Digital business card</p>
        </div>
        <div className="space-y-1">
          <h2 className={`${compact ? "text-base" : "text-3xl"} font-semibold`}>{card.lastName} {card.firstName}</h2>
          {card.company ? <p className="text-current/75">{card.company}</p> : null}
          {card.department || card.jobTitle ? <p className="text-current/55">{[card.department, card.jobTitle].filter(Boolean).join(" / ")}</p> : null}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {card.lastNameKana || card.firstNameKana ? <p className="text-xs text-current/55">{[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}</p> : null}
        {card.phone ? <p>{card.phone}</p> : null}
        {card.email ? <p className="break-all">{card.email}</p> : null}
        {card.websiteUrl ? <p className="break-all" style={{ color: "var(--accent)" }}>{card.websiteUrl}</p> : null}
        {card.address ? <p className="text-current/65">{[card.postalCode, card.address].filter(Boolean).join(" ")}</p> : null}
        <div className="mt-auto text-xs text-current/55">@{card.handle}</div>
      </div>
    </article>
  );
}
