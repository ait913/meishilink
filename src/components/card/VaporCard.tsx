import type { CSSProperties, ReactNode } from "react";

import { SnsIcon } from "@/components/icons/SnsIcon";
import type { PreviewProps } from "@/components/card/CardPreview";

const grid = (color: string) =>
  `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;

export function VaporCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  const site = card.websiteUrl ?? "";
  const siteHref = site ? (site.startsWith("http") ? site : `https://${site}`) : "";
  const accent = "var(--accent)";

  return (
    <article
      className="card-surface relative flex aspect-[55/91] w-full flex-col gap-3 overflow-hidden rounded-[1rem] border-[2px] px-6 py-6"
      style={{
        ...style,
        backgroundImage: `${grid("rgba(255,255,255,0.08)")}, linear-gradient(180deg, transparent 0%, transparent 50%, currentColor 50%, currentColor 100%)`,
        backgroundSize: "20px 20px, 20px 20px, 100% 100%",
        backgroundBlendMode: "normal, normal, color-burn",
      }}
    >
      {/* horizon glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, boxShadow: `0 0 12px ${accent}` }}
      />

      <div className="relative flex items-start justify-between text-[10px] uppercase tracking-[0.32em]" style={{ color: accent }}>
        <span>// MeishiLink</span>
        <span>@{card.handle}</span>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <div className="space-y-2 text-center">
          <h2 className="text-[1.9rem] font-bold leading-tight" style={{ color: accent, textShadow: `0 0 16px ${accent}` }}>
            {card.fullName}
          </h2>
          {card.lastNameKana || card.firstNameKana ? (
            <p className="text-[10px] tracking-[0.4em] text-current/70">{[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}</p>
          ) : null}
          {card.jobTitle ? <p className="text-[11px] tracking-[0.3em] text-current/85">› {card.jobTitle.toUpperCase()}</p> : null}
        </div>
      </div>

      <div className="relative space-y-1 text-[10px] tracking-wider text-current/85">
        {card.company ? <p className="font-semibold" style={{ color: accent }}>{card.company}</p> : null}
        {card.phone ? (
          <p>
            tel ▸ <a className="hover:underline" href={`tel:${card.phone.replace(/[^0-9+]/g, "")}`}>{card.phone}</a>
          </p>
        ) : null}
        {card.email ? (
          <p className="break-all">
            mail ▸ <a className="hover:underline" href={`mailto:${card.email}`}>{card.email}</a>
          </p>
        ) : null}
        {siteHref ? (
          <p className="break-all">
            <a className="inline-flex items-center gap-1 hover:underline" href={siteHref} rel="noopener noreferrer" target="_blank" style={{ color: accent }}>
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
              <a aria-label={sns.label} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-current/40 text-current transition hover:bg-current/10" href={sns.url} rel="noopener noreferrer" target="_blank" title={sns.label} style={{ color: accent }}>
                <SnsIcon className="h-3.5 w-3.5" url={sns.url} />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {logo ? <div className="relative mt-1 flex justify-end">{logo}</div> : null}
    </article>
  );
}
