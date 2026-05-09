import type { CSSProperties, ReactNode } from "react";

import { SnsIcon } from "@/components/icons/SnsIcon";
import type { PreviewProps } from "@/components/card/CardPreview";

export function StickerCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  const site = card.websiteUrl ?? "";
  const siteHref = site ? (site.startsWith("http") ? site : `https://${site}`) : "";

  return (
    <article
      className="card-surface relative flex aspect-[55/91] w-full flex-col gap-3 overflow-hidden rounded-[2.5rem] border-[3px] px-6 py-7 shadow-[0_12px_0_0_rgba(0,0,0,0.08)]"
      style={style}
    >
      {/* dot pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          color: "var(--accent)",
        }}
      />

      <div className="relative flex items-start justify-between">
        <span className="rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white" style={{ backgroundColor: "var(--accent)" }}>
          ★ MeishiLink
        </span>
        {logo}
      </div>

      <div className="relative flex flex-1 flex-col justify-center space-y-1">
        <h2 className="text-[2rem] font-extrabold leading-[1.05] tracking-tight">{card.fullName}</h2>
        {card.lastNameKana || card.firstNameKana ? (
          <p className="text-[11px] font-semibold text-current/65">{[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}</p>
        ) : null}
        {card.jobTitle ? (
          <span className="mt-2 inline-flex w-fit -rotate-2 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-md" style={{ backgroundColor: "var(--accent)" }}>
            {card.jobTitle}
          </span>
        ) : null}
        {card.company ? <p className="mt-1 text-[12px] font-bold text-current">@ {card.company}</p> : null}
      </div>

      <div className="relative space-y-1 text-[11px] font-medium text-current/85">
        {card.phone ? (
          <p>
            <a className="hover:underline" href={`tel:${card.phone.replace(/[^0-9+]/g, "")}`}>📞 {card.phone}</a>
          </p>
        ) : null}
        {card.email ? (
          <p className="break-all">
            <a className="hover:underline" href={`mailto:${card.email}`}>✉ {card.email}</a>
          </p>
        ) : null}
        {siteHref ? (
          <p className="break-all">
            <a className="inline-flex items-center gap-1 hover:underline" href={siteHref} rel="noopener noreferrer" target="_blank">
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
              <a aria-label={sns.label} className="inline-flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-current text-current shadow-[0_2px_0_currentColor] transition active:translate-y-[2px] active:shadow-none" href={sns.url} rel="noopener noreferrer" target="_blank" title={sns.label}>
                <SnsIcon className="h-3.5 w-3.5" url={sns.url} />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
