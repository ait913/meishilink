import type { CSSProperties, ReactNode } from "react";

import { SnsIcon } from "@/components/icons/SnsIcon";
import type { PreviewProps } from "@/components/card/CardPreview";

export function DoodleCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  const site = card.websiteUrl ?? "";
  const siteHref = site ? (site.startsWith("http") ? site : `https://${site}`) : "";

  return (
    <article
      className="card-surface relative flex aspect-[55/91] w-full flex-col gap-3 overflow-hidden rounded-[1.5rem] border-[2px] px-6 py-7"
      style={{ ...style, fontFamily: '"Klee One", "Hiragino Maru Gothic ProN", "M PLUS Rounded 1c", system-ui, sans-serif' }}
    >
      {/* paper notebook lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-20 bottom-6"
        style={{
          backgroundImage: "repeating-linear-gradient(transparent 0px, transparent 23px, currentColor 23px, currentColor 24px)",
          opacity: 0.08,
        }}
      />

      <div className="relative flex items-start justify-between">
        <span className="-rotate-3 rounded-md border-[2px] border-current bg-white/60 px-2 py-0.5 text-[10px] font-bold">
          ★ Hello!
        </span>
        {logo}
      </div>

      <div className="relative space-y-1">
        <h2 className="-rotate-1 text-[1.85rem] font-bold leading-tight">
          <span className="relative inline-block">
            {card.fullName}
            <span
              className="absolute inset-x-0 bottom-1 h-2"
              style={{ backgroundColor: "var(--accent)", opacity: 0.35, transform: "rotate(-1deg)" }}
            />
          </span>
        </h2>
        {card.lastNameKana || card.firstNameKana ? (
          <p className="text-[10px] text-current/70">「{[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}」</p>
        ) : null}
      </div>

      <div className="relative space-y-1.5 text-[12px] leading-relaxed text-current/85">
        {card.company ? <p className="font-bold">📎 {card.company}</p> : null}
        {card.department || card.jobTitle ? (
          <p className="text-current/70">└ {[card.department, card.jobTitle].filter(Boolean).join(" / ")}</p>
        ) : null}
        {card.phone ? (
          <p>
            ☎ <a className="hover:underline" href={`tel:${card.phone.replace(/[^0-9+]/g, "")}`}>{card.phone}</a>
          </p>
        ) : null}
        {card.email ? (
          <p className="break-all">
            ✉ <a className="hover:underline" href={`mailto:${card.email}`}>{card.email}</a>
          </p>
        ) : null}
        {siteHref ? (
          <p className="break-all">
            <a className="inline-flex items-center gap-1 hover:underline" href={siteHref} rel="noopener noreferrer" target="_blank" style={{ color: "var(--accent)" }}>
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
              <a aria-label={sns.label} className="inline-flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-current text-current transition hover:bg-current/10" href={sns.url} rel="noopener noreferrer" target="_blank" title={sns.label}>
                <SnsIcon className="h-3.5 w-3.5" url={sns.url} />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative mt-auto text-right text-[10px] text-current/55">@{card.handle}</div>
    </article>
  );
}
