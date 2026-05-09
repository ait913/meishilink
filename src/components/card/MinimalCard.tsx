import type { CSSProperties, ReactNode } from "react";

import type { PreviewProps } from "@/components/card/CardPreview";

export function MinimalCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  return (
    <article
      className="card-surface flex aspect-[55/91] w-full flex-col gap-4 rounded-[1.25rem] border px-6 py-7"
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        {logo}
        <span className="text-[9px] uppercase tracking-[0.32em] text-current/55">
          @{card.handle}
        </span>
      </div>
      <div className="space-y-1">
        <h2 className="text-[1.45rem] font-semibold leading-tight tracking-tight">
          {card.lastName} {card.firstName}
        </h2>
        {card.lastNameKana || card.firstNameKana ? (
          <p className="text-[10px] tracking-[0.2em] text-current/55">
            {[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5 text-[11px] leading-relaxed text-current/85">
        {card.company ? <p className="font-medium text-current">{card.company}</p> : null}
        {card.department || card.jobTitle ? (
          <p className="text-current/65">{[card.department, card.jobTitle].filter(Boolean).join(" / ")}</p>
        ) : null}
      </div>
      <dl className="grid gap-1 text-[10.5px] text-current/85">
        {card.phone ? (
          <div className="grid grid-cols-[2.5rem,1fr] gap-2"><dt className="text-current/55">tel.</dt><dd>{card.phone}</dd></div>
        ) : null}
        {card.email ? (
          <div className="grid grid-cols-[2.5rem,1fr] gap-2"><dt className="text-current/55">mail.</dt><dd className="break-all">{card.email}</dd></div>
        ) : null}
        {card.websiteUrl ? (
          <div className="grid grid-cols-[2.5rem,1fr] gap-2"><dt className="text-current/55">web.</dt><dd className="break-all">{card.websiteUrl.replace(/^https?:\/\//, "")}</dd></div>
        ) : null}
        {card.address || card.postalCode ? (
          <div className="grid grid-cols-[2.5rem,1fr] gap-2"><dt className="text-current/55">add.</dt><dd>{[card.postalCode ? `〒${card.postalCode}` : "", card.address].filter(Boolean).join(" ")}</dd></div>
        ) : null}
      </dl>
      <div className="mt-auto border-t border-current/10 pt-2 text-[9px] tracking-[0.32em] text-current/40" style={{ color: "var(--accent)" }}>
        MEISHILINK
      </div>
    </article>
  );
}
