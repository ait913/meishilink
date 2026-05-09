import type { CSSProperties, ReactNode } from "react";

import { SnsIcon } from "@/components/icons/SnsIcon";
import type { PreviewProps } from "@/components/card/CardPreview";

const romanize = (last: string, first: string) =>
  [last, first]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

export function NavyCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  const roman = romanize(card.lastName, card.firstName);
  const site = card.websiteUrl ?? "";
  const siteHref = site ? (site.startsWith("http") ? site : `https://${site}`) : "";

  return (
    <article
      className="card-surface relative flex aspect-[55/91] w-full flex-col gap-4 overflow-hidden rounded-[1.25rem] border px-6 py-7"
      style={style}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),transparent_60%)]" />

      {card.jobTitle ? (
        <p className="text-[10px] tracking-[0.32em] text-current/65">{card.jobTitle}</p>
      ) : null}

      <div className="space-y-1">
        <h2 className="text-[1.45rem] font-semibold leading-tight">
          {card.lastName} {card.firstName}
        </h2>
        <p className="text-[10px] tracking-[0.28em] text-current/60">{roman}</p>
      </div>

      <div className="space-y-1.5 text-[11px] leading-relaxed text-current/85">
        {card.company ? <p className="font-medium text-current">{card.company}</p> : null}
        {card.department ? <p className="text-current/70">{card.department}</p> : null}
        {card.postalCode ? <p>〒{card.postalCode}</p> : null}
        {card.address ? <p>{card.address}</p> : null}
        {card.phone ? (
          <p>
            tel.{" "}
            <a className="hover:underline" href={`tel:${card.phone.replace(/[^0-9+]/g, "")}`}>
              {card.phone}
            </a>
          </p>
        ) : null}
        {card.email ? (
          <p className="break-all">
            mail.{" "}
            <a className="hover:underline" href={`mailto:${card.email}`}>
              {card.email}
            </a>
          </p>
        ) : null}
        {siteHref ? (
          <p className="break-all">
            <a
              className="inline-flex items-center gap-1 hover:underline"
              href={siteHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              <SnsIcon className="h-3 w-3" url={siteHref} />
              {siteHref.replace(/^https?:\/\//, "")}
            </a>
          </p>
        ) : null}
      </div>

      {card.snsLinks.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {card.snsLinks.map((sns) => (
            <li key={sns.url}>
              <a
                aria-label={sns.label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/30 text-current/85 transition hover:bg-white/10"
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

      <div className="mt-auto flex items-center gap-3">
        {logo}
        {card.company ? (
          <span className="text-[11px] font-medium tracking-wide text-current/85">{card.company}</span>
        ) : (
          <span className="text-[10px] tracking-[0.2em] text-current/55">@{card.handle}</span>
        )}
      </div>
    </article>
  );
}
