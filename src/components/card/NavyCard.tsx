import type { CSSProperties, ReactNode } from "react";

import type { PreviewProps } from "@/components/card/CardPreview";

export function NavyCard({
  card,
  compact = false,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  return (
    <article className={`card-surface relative flex w-full flex-col gap-5 overflow-hidden rounded-[2rem] border p-5 ${compact ? "aspect-[91/55] text-[11px]" : "min-h-[24rem]"}`} style={style}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(135deg,rgba(56,189,248,0.2),transparent)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-current/55">Public profile</p>
          <h2 className={`${compact ? "text-lg" : "text-3xl"} font-semibold`}>{card.lastName} {card.firstName}</h2>
          {card.company ? <p className="text-current/80">{card.company}</p> : null}
          {card.department || card.jobTitle ? <p className="text-current/55">{[card.department, card.jobTitle].filter(Boolean).join(" / ")}</p> : null}
        </div>
        {logo}
      </div>
      <div className="relative grid gap-3 md:grid-cols-2">
        {card.phone ? <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-3">{card.phone}</div> : null}
        {card.email ? <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-3 break-all">{card.email}</div> : null}
        {card.websiteUrl ? <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-3 break-all" style={{ color: "var(--accent)" }}>{card.websiteUrl}</div> : null}
        {card.address ? <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-3">{[card.postalCode, card.address].filter(Boolean).join(" ")}</div> : null}
      </div>
      <div className="relative mt-auto text-xs text-current/55">@{card.handle}</div>
    </article>
  );
}
