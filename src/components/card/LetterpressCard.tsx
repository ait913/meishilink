import type { CSSProperties, ReactNode } from "react";

import { SnsIcon } from "@/components/icons/SnsIcon";
import type { PreviewProps } from "@/components/card/CardPreview";

const noiseDataUrl =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='1' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

const upper = (s?: string | null) => (s ? s.toUpperCase() : "");

export function LetterpressCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  const site = card.websiteUrl ?? "";
  const siteHref = site ? (site.startsWith("http") ? site : `https://${site}`) : "";

  return (
    <article
      className="card-surface relative flex aspect-[55/91] w-full flex-col gap-5 overflow-hidden rounded-[0.75rem] border px-7 py-9"
      style={{
        ...style,
        fontFamily: '"Cormorant Garamond", "Shippori Mincho", "Hiragino Mincho ProN", serif',
        backgroundImage: `${noiseDataUrl}, linear-gradient(180deg, #efe8dc 0%, #e7dec7 100%)`,
      }}
    >
      <div className="relative flex items-start justify-between gap-3">
        {logo}
        <span className="text-[8px] uppercase tracking-[0.5em] text-current/50">est. 2026</span>
      </div>

      <div className="relative mt-auto space-y-2">
        <h2
          className="text-[2.2rem] font-medium leading-[1.05] tracking-tight"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          {upper(card.fullName) || card.handle}
        </h2>
        {card.lastNameKana || card.firstNameKana ? (
          <p className="text-[10px] tracking-[0.32em] text-current/55">
            {[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}
          </p>
        ) : null}
      </div>

      <div className="relative h-px w-12 bg-current/40" />

      <div className="relative space-y-1.5 text-[11px] leading-relaxed text-current/80">
        {card.company ? <p className="font-medium uppercase tracking-[0.2em]" style={{ fontFamily: '"Cormorant Garamond", serif' }}>{card.company}</p> : null}
        {card.department || card.jobTitle ? (
          <p className="text-current/60">{[card.department, card.jobTitle].filter(Boolean).join(" · ")}</p>
        ) : null}
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
              target="_blank"
            >
              <SnsIcon className="h-3 w-3" url={siteHref} />
              {siteHref.replace(/^https?:\/\//, "")}
            </a>
          </p>
        ) : null}
      </div>

      {card.snsLinks.length > 0 ? (
        <ul className="relative flex flex-wrap gap-2">
          {card.snsLinks.map((sns) => (
            <li key={sns.url}>
              <a
                aria-label={sns.label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/30 text-current/85 transition hover:bg-current/5"
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

      <div className="relative text-[8px] uppercase tracking-[0.4em] text-current/40">@{card.handle}</div>
    </article>
  );
}
