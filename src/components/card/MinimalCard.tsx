import type { CSSProperties, ReactNode } from "react";

import type { PreviewProps } from "@/components/card/CardPreview";

export function MinimalCard({
  card,
  compact = false,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  return (
    <article className={`card-surface flex w-full flex-col gap-4 rounded-[2rem] border p-5 ${compact ? "aspect-[91/55] p-4 text-[11px]" : "min-h-[24rem] text-sm"}`} style={style}>
      <div className="flex items-start gap-4">
        {logo}
        <div className="space-y-1">
          <h2 className={`${compact ? "text-lg" : "text-3xl"} font-semibold tracking-tight`}>
            {card.lastName} {card.firstName}
          </h2>
          {card.lastNameKana || card.firstNameKana ? (
            <p className="text-xs text-current/65">
              {[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}
            </p>
          ) : null}
          {card.company ? <p className="font-medium">{card.company}</p> : null}
          {card.department || card.jobTitle ? <p className="text-current/65">{[card.department, card.jobTitle].filter(Boolean).join(" / ")}</p> : null}
        </div>
      </div>
      <dl className="grid gap-2 text-current/85">
        {card.phone ? <div className="grid grid-cols-[3.5rem,1fr] gap-2"><dt className="text-current/55">TEL</dt><dd>{card.phone}</dd></div> : null}
        {card.email ? <div className="grid grid-cols-[3.5rem,1fr] gap-2"><dt className="text-current/55">Mail</dt><dd className="break-all">{card.email}</dd></div> : null}
        {card.websiteUrl ? <div className="grid grid-cols-[3.5rem,1fr] gap-2"><dt className="text-current/55">Site</dt><dd className="break-all">{card.websiteUrl}</dd></div> : null}
        {card.address ? <div className="grid grid-cols-[3.5rem,1fr] gap-2"><dt className="text-current/55">住所</dt><dd>{[card.postalCode, card.address].filter(Boolean).join(" ")}</dd></div> : null}
      </dl>
      <div className="mt-auto flex items-center justify-between border-t border-current/10 pt-3 text-xs text-current/55">
        <span>@{card.handle}</span>
        <span style={{ color: "var(--accent)" }}>MeishiLink</span>
      </div>
    </article>
  );
}
