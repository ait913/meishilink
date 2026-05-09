import type { CSSProperties, ReactNode } from "react";

import type { PreviewProps } from "@/components/card/CardPreview";

export function MonoCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  return (
    <article
      className="card-surface flex aspect-[55/91] w-full flex-col gap-4 rounded-[1.25rem] border px-6 py-7"
      style={style}
    >
      <div className="flex items-start justify-between gap-3 border-b border-current/15 pb-3">
        {logo}
        <p className="text-[9px] uppercase tracking-[0.32em] text-current/55">Digital business card</p>
      </div>
      <div className="space-y-1">
        <h2 className="text-[1.45rem] font-semibold leading-tight">{card.lastName} {card.firstName}</h2>
        {card.lastNameKana || card.firstNameKana ? (
          <p className="text-[10px] tracking-[0.2em] text-current/55">{[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}</p>
        ) : null}
      </div>
      <div className="space-y-1.5 text-[11px] text-current/85">
        {card.company ? <p className="font-medium text-current">{card.company}</p> : null}
        {card.department || card.jobTitle ? (
          <p className="text-current/65">{[card.department, card.jobTitle].filter(Boolean).join(" / ")}</p>
        ) : null}
      </div>
      <div className="grid gap-1 text-[10.5px] text-current/85">
        {card.phone ? <p>tel. {card.phone}</p> : null}
        {card.email ? <p className="break-all">mail. {card.email}</p> : null}
        {card.websiteUrl ? (
          <p className="break-all" style={{ color: "var(--accent)" }}>{card.websiteUrl.replace(/^https?:\/\//, "")}</p>
        ) : null}
        {card.address || card.postalCode ? (
          <p className="text-current/65">{[card.postalCode ? `〒${card.postalCode}` : "", card.address].filter(Boolean).join(" ")}</p>
        ) : null}
      </div>
      <div className="mt-auto border-t border-current/15 pt-2 text-[9px] tracking-[0.32em] text-current/55">
        @{card.handle}
      </div>
    </article>
  );
}
