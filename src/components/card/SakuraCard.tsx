import type { CSSProperties, ReactNode } from "react";

import type { PreviewProps } from "@/components/card/CardPreview";

export function SakuraCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  return (
    <article
      className="card-surface relative flex aspect-[55/91] w-full flex-col gap-4 overflow-hidden rounded-[1.25rem] border px-6 py-7"
      style={style}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(219,39,119,0.15),transparent_45%)]" />
      <div className="relative flex items-start justify-between gap-3">
        {logo}
        <span className="text-[9px] uppercase tracking-[0.32em] text-current/55">Sakura</span>
      </div>
      <div className="relative space-y-1">
        <h2 className="text-[1.45rem] font-semibold leading-tight">{card.lastName} {card.firstName}</h2>
        {card.lastNameKana || card.firstNameKana ? (
          <p className="text-[10px] tracking-[0.2em] text-current/55">{[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}</p>
        ) : null}
      </div>
      <div className="relative rounded-[1rem] border border-current/10 bg-white/45 p-3 text-[11px] text-current/85">
        {card.company ? <p className="font-medium text-current">{card.company}</p> : null}
        {card.department || card.jobTitle ? (
          <p className="text-current/65">{[card.department, card.jobTitle].filter(Boolean).join(" / ")}</p>
        ) : null}
        <div className="mt-2 grid gap-1">
          {card.phone ? <p>{card.phone}</p> : null}
          {card.email ? <p className="break-all">{card.email}</p> : null}
          {card.websiteUrl ? <p className="break-all" style={{ color: "var(--accent)" }}>{card.websiteUrl.replace(/^https?:\/\//, "")}</p> : null}
          {card.address || card.postalCode ? (
            <p className="text-current/65">{[card.postalCode ? `〒${card.postalCode}` : "", card.address].filter(Boolean).join(" ")}</p>
          ) : null}
        </div>
      </div>
      <div className="relative mt-auto text-[10px] tracking-[0.2em] text-current/55">@{card.handle}</div>
    </article>
  );
}
