import type { CSSProperties, ReactNode } from "react";

import { SnsIcon } from "@/components/icons/SnsIcon";
import type { PreviewProps } from "@/components/card/CardPreview";

export function WarmCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  const site = card.websiteUrl ?? "";
  const siteHref = site ? (site.startsWith("http") ? site : `https://${site}`) : "";

  return (
    <article
      className="card-surface relative flex aspect-[55/91] w-full flex-col gap-4 overflow-hidden rounded-[1.25rem] border px-6 py-7"
      style={style}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[color:var(--accent)]/12 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        {logo}
        <span className="text-[9px] uppercase tracking-[0.32em] text-current/55">Warm</span>
      </div>
      <div className="relative space-y-1">
        <h2 className="text-[1.45rem] font-semibold leading-tight">{card.fullName}</h2>
        {card.lastNameKana || card.firstNameKana ? (
          <p className="text-[10px] tracking-[0.2em] text-current/55">{[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}</p>
        ) : null}
      </div>
      <div className="relative space-y-1.5 rounded-[1rem] border border-current/10 bg-white/40 p-3 text-[11px] text-current/85">
        {card.company ? <p className="font-medium">{card.company}</p> : null}
        {card.department || card.jobTitle ? <p className="text-current/65">{[card.department, card.jobTitle].filter(Boolean).join(" / ")}</p> : null}
        {card.phone ? (
          <p>
            <a className="hover:underline" href={`tel:${card.phone.replace(/[^0-9+]/g, "")}`}>{card.phone}</a>
          </p>
        ) : null}
        {card.email ? (
          <p className="break-all">
            <a className="hover:underline" href={`mailto:${card.email}`}>{card.email}</a>
          </p>
        ) : null}
        {siteHref ? (
          <p className="break-all">
            <a
              className="inline-flex items-center gap-1 hover:underline"
              href={siteHref}
              rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}
              target="_blank"
            >
              <SnsIcon className="h-3 w-3" url={siteHref} />
              {siteHref.replace(/^https?:\/\//, "")}
            </a>
          </p>
        ) : null}
        {card.address || card.postalCode ? (
          <p className="text-current/65">{[card.postalCode ? `〒${card.postalCode}` : "", card.address].filter(Boolean).join(" ")}</p>
        ) : null}
      </div>
      {card.snsLinks.length > 0 ? (
        <ul className="relative flex flex-wrap gap-2">
          {card.snsLinks.map((sns) => (
            <li key={sns.url}>
              <a
                aria-label={sns.label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/20 text-current/85 transition hover:bg-white/40"
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
      <div className="relative mt-auto text-[10px] tracking-[0.2em] text-current/55">@{card.handle}</div>
    </article>
  );
}
