import type { CSSProperties, ReactNode } from "react";

import type { PreviewProps } from "@/components/card/CardPreview";

export function WarmCard({
  card,
  compact = false,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  return (
    <article className={`card-surface relative flex w-full flex-col gap-4 overflow-hidden rounded-[2rem] border p-5 ${compact ? "aspect-[91/55] text-[11px]" : "min-h-[24rem]"}`} style={style}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[color:var(--accent)]/12 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-current/55">Warm profile</p>
          <h2 className={`${compact ? "text-lg" : "text-3xl"} font-semibold`}>{card.lastName} {card.firstName}</h2>
          {card.lastNameKana || card.firstNameKana ? <p className="text-xs text-current/55">{[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}</p> : null}
        </div>
        {logo}
      </div>
      <div className="relative grid gap-2 rounded-[1.5rem] border border-current/10 bg-white/35 p-4">
        {card.company ? <p className="font-medium">{card.company}</p> : null}
        {card.department || card.jobTitle ? <p className="text-current/65">{[card.department, card.jobTitle].filter(Boolean).join(" / ")}</p> : null}
        {card.phone ? <p>{card.phone}</p> : null}
        {card.email ? <p className="break-all">{card.email}</p> : null}
        {card.websiteUrl ? <p className="break-all" style={{ color: "var(--accent)" }}>{card.websiteUrl}</p> : null}
        {card.address ? <p className="text-current/65">{[card.postalCode, card.address].filter(Boolean).join(" ")}</p> : null}
      </div>
      <div className="relative mt-auto text-xs text-current/55">@{card.handle}</div>
    </article>
  );
}
