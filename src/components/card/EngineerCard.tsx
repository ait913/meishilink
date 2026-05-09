import type { CSSProperties, ReactNode } from "react";

import { SnsIcon } from "@/components/icons/SnsIcon";
import type { PreviewProps } from "@/components/card/CardPreview";

export function EngineerCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  const site = card.websiteUrl ?? "";
  const siteHref = site ? (site.startsWith("http") ? site : `https://${site}`) : "";
  const accent = "var(--accent)";

  return (
    <article
      className="card-surface flex aspect-[55/91] w-full flex-col gap-3 overflow-hidden rounded-[0.875rem] border px-5 py-6"
      style={{
        ...style,
        fontFamily: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
      }}
    >
      {/* Window-bar style header */}
      <div className="flex items-center justify-between gap-3 border-b border-current/15 pb-2 text-[10px] tracking-[0.1em] text-current/55">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#f87171]" />
          <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
          <span className="h-2 w-2 rounded-full bg-[#34d399]" />
        </div>
        <span>~/{card.handle}</span>
      </div>

      {/* prompt + name */}
      <div className="space-y-2">
        <p className="text-[10px] text-current/55">
          <span style={{ color: accent }}>$</span> whoami
        </p>
        <h2 className="text-[1.5rem] font-semibold leading-tight" style={{ color: accent }}>
          {card.fullName || `@${card.handle}`}
        </h2>
        {card.lastNameKana || card.firstNameKana ? (
          <p className="text-[10px] text-current/55">
            // {[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}
          </p>
        ) : null}
      </div>

      <div className="space-y-1 text-[11px] leading-relaxed">
        {card.company ? (
          <p className="text-current/85">
            <span className="text-current/55">org:</span> &quot;{card.company}&quot;
          </p>
        ) : null}
        {card.department || card.jobTitle ? (
          <p className="text-current/85">
            <span className="text-current/55">role:</span> &quot;{[card.department, card.jobTitle].filter(Boolean).join(" / ")}&quot;
          </p>
        ) : null}
        {card.phone ? (
          <p className="text-current/85">
            <span className="text-current/55">tel:</span> &quot;
            <a className="underline-offset-2 hover:underline" href={`tel:${card.phone.replace(/[^0-9+]/g, "")}`}>
              {card.phone}
            </a>
            &quot;
          </p>
        ) : null}
        {card.email ? (
          <p className="break-all text-current/85">
            <span className="text-current/55">mail:</span> &quot;
            <a className="underline-offset-2 hover:underline" href={`mailto:${card.email}`}>
              {card.email}
            </a>
            &quot;
          </p>
        ) : null}
        {siteHref ? (
          <p className="break-all text-current/85">
            <span className="text-current/55">web:</span> &quot;
            <a
              className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
              href={siteHref}
              rel="noopener noreferrer"
              target="_blank"
              style={{ color: accent }}
            >
              <SnsIcon className="h-3 w-3" url={siteHref} />
              {siteHref.replace(/^https?:\/\//, "")}
            </a>
            &quot;
          </p>
        ) : null}
        {card.address || card.postalCode ? (
          <p className="text-current/65">
            <span className="text-current/55">loc:</span> &quot;{[card.postalCode, card.address].filter(Boolean).join(" ")}&quot;
          </p>
        ) : null}
      </div>

      {card.snsLinks.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {card.snsLinks.map((sns) => (
            <li key={sns.url}>
              <a
                aria-label={sns.label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-current/30 text-current/85 transition hover:bg-current/10"
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

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-current/15 pt-2">
        {logo ?? <span className="text-[10px] text-current/40">// no logo</span>}
        <span className="text-[10px] text-current/55">
          <span style={{ color: accent }}>$</span> exit
        </span>
      </div>
    </article>
  );
}
