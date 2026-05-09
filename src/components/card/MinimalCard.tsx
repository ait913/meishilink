import type { CSSProperties, ReactNode } from "react";

import { SnsIcon } from "@/components/icons/SnsIcon";
import type { PreviewProps } from "@/components/card/CardPreview";

export function MinimalCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  const site = card.websiteUrl ?? "";
  const siteHref = site ? (site.startsWith("http") ? site : `https://${site}`) : "";

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
          <div className="grid grid-cols-[2.5rem,1fr] gap-2">
            <dt className="text-current/55">tel.</dt>
            <dd>
              <a className="hover:underline" href={`tel:${card.phone.replace(/[^0-9+]/g, "")}`}>
                {card.phone}
              </a>
            </dd>
          </div>
        ) : null}
        {card.email ? (
          <div className="grid grid-cols-[2.5rem,1fr] gap-2">
            <dt className="text-current/55">mail.</dt>
            <dd className="break-all">
              <a className="hover:underline" href={`mailto:${card.email}`}>
                {card.email}
              </a>
            </dd>
          </div>
        ) : null}
        {siteHref ? (
          <div className="grid grid-cols-[2.5rem,1fr] gap-2">
            <dt className="text-current/55">web.</dt>
            <dd className="break-all">
              <a
                className="inline-flex items-center gap-1 hover:underline"
                href={siteHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                <SnsIcon className="h-3 w-3" url={siteHref} />
                {siteHref.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        ) : null}
        {card.address || card.postalCode ? (
          <div className="grid grid-cols-[2.5rem,1fr] gap-2">
            <dt className="text-current/55">add.</dt>
            <dd>{[card.postalCode ? `〒${card.postalCode}` : "", card.address].filter(Boolean).join(" ")}</dd>
          </div>
        ) : null}
      </dl>
      {card.snsLinks.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {card.snsLinks.map((sns) => (
            <li key={sns.url}>
              <a
                aria-label={sns.label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/20 text-current/85 transition hover:bg-current/5"
                href={sns.url}
                rel="noopener noreferrer"
                target="_blank"
                title={sns.label}
              >
                <SnsIcon className="h-3.5 w-3.5" url={sns.url} />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-auto border-t border-current/10 pt-2 text-[9px] tracking-[0.32em] text-current/40" style={{ color: "var(--accent)" }}>
        MEISHILINK
      </div>
    </article>
  );
}
