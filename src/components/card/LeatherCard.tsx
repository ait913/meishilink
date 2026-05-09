import type { CSSProperties, ReactNode } from "react";

import { SnsIcon } from "@/components/icons/SnsIcon";
import type { PreviewProps } from "@/components/card/CardPreview";

const leatherTexture =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.6' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

export function LeatherCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  const site = card.websiteUrl ?? "";
  const siteHref = site ? (site.startsWith("http") ? site : `https://${site}`) : "";

  return (
    <article
      className="card-surface relative flex aspect-[55/91] w-full flex-col overflow-hidden rounded-[1.25rem] border px-7 py-8"
      style={{
        ...style,
        backgroundImage: `${leatherTexture}, radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06), transparent 60%)`,
      }}
    >
      {/* gold monogram chip */}
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-md text-lg font-semibold tracking-widest text-neutral-900 shadow-md" style={{ backgroundImage: "linear-gradient(135deg,#e8c97a,#a87a3a)" }}>
        {(card.lastName?.[0] ?? card.fullName?.[0] ?? "M").toString().toUpperCase()}
        {(card.firstName?.[0] ?? card.fullName?.[1] ?? "L").toString().toUpperCase()}
      </div>

      <div className="space-y-1 text-center">
        <h2 className="text-[2rem] leading-tight" style={{ fontFamily: '"Pinyon Script", "Allura", cursive', color: "var(--accent)" }}>
          {card.fullName}
        </h2>
        {card.lastNameKana || card.firstNameKana ? (
          <p className="text-[10px] tracking-[0.4em] text-current/60">
            {[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}
          </p>
        ) : null}
      </div>

      <div className="my-4 mx-auto h-px w-12" style={{ backgroundColor: "var(--accent)" }} />

      <div className="space-y-1 text-center text-[11px] leading-relaxed text-current/85">
        {card.jobTitle ? <p className="tracking-[0.3em]" style={{ color: "var(--accent)" }}>{card.jobTitle.toUpperCase()}</p> : null}
        {card.company ? <p className="font-medium">{card.company}</p> : null}
        {card.department ? <p className="text-current/65">{card.department}</p> : null}
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
            <a className="inline-flex items-center gap-1 hover:underline" href={siteHref} rel="noopener noreferrer" target="_blank">
              <SnsIcon className="h-3 w-3" url={siteHref} />
              {siteHref.replace(/^https?:\/\//, "")}
            </a>
          </p>
        ) : null}
      </div>

      {card.snsLinks.length > 0 ? (
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {card.snsLinks.map((sns) => (
            <li key={sns.url}>
              <a aria-label={sns.label} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/30 text-current/85 transition hover:bg-white/10" href={sns.url} rel="noopener noreferrer" target="_blank" title={sns.label}>
                <SnsIcon className="h-3.5 w-3.5" url={sns.url} />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {logo ? <div className="mt-auto flex justify-center pt-3">{logo}</div> : null}
    </article>
  );
}
