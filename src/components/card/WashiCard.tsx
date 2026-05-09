import type { CSSProperties, ReactNode } from "react";

import { SnsIcon } from "@/components/icons/SnsIcon";
import type { PreviewProps } from "@/components/card/CardPreview";

const noiseDataUrl =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.13  0 0 0 0 0.09  0 0 0 0.08 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

export function WashiCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  const site = card.websiteUrl ?? "";
  const siteHref = site ? (site.startsWith("http") ? site : `https://${site}`) : "";
  const fullKana = [card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ");

  return (
    <article
      className="card-surface relative flex aspect-[55/91] w-full flex-col gap-4 overflow-hidden rounded-[1rem] border px-7 py-8"
      style={{
        ...style,
        fontFamily: '"Shippori Mincho", "Noto Serif JP", "Hiragino Mincho ProN", serif',
        backgroundImage: `${noiseDataUrl}, linear-gradient(170deg, #f5ecdb 0%, #ede1c8 100%)`,
        backgroundBlendMode: "multiply, normal",
      }}
    >
      {/* paper edge accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent,rgba(146,64,14,0.25),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,transparent,rgba(146,64,14,0.25),transparent)]" />

      {card.jobTitle ? (
        <p
          className="absolute right-7 top-8 text-[10px] tracking-[0.5em] text-current/65"
          style={{ writingMode: "vertical-rl" }}
        >
          {card.jobTitle}
        </p>
      ) : null}

      <div className="relative flex flex-1 items-center justify-center gap-4">
        <h2
          className="text-[2rem] font-medium leading-[1.4] tracking-[0.4em]"
          style={{ writingMode: "vertical-rl", color: "var(--accent)" }}
        >
          {card.fullName}
        </h2>
        {fullKana ? (
          <p
            className="text-[10px] tracking-[0.4em] text-current/55"
            style={{ writingMode: "vertical-rl" }}
          >
            {fullKana}
          </p>
        ) : null}
      </div>

      <div className="relative space-y-1.5 border-t border-current/15 pt-4 text-[11px] leading-relaxed text-current/85">
        {card.company ? <p className="font-medium tracking-wide">{card.company}</p> : null}
        {card.department ? <p className="text-current/65">{card.department}</p> : null}
        {card.postalCode ? <p>〒{card.postalCode}</p> : null}
        {card.address ? <p>{card.address}</p> : null}
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

      {logo ? <div className="relative mt-1 flex items-center gap-3">{logo}</div> : null}
    </article>
  );
}
