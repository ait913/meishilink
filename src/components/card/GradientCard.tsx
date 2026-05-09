import type { CSSProperties, ReactNode } from "react";

import { SnsIcon } from "@/components/icons/SnsIcon";
import type { PreviewProps } from "@/components/card/CardPreview";

const meshes: Record<string, string> = {
  sunset:
    "radial-gradient(at 20% 10%, #ffd166 0px, transparent 50%), radial-gradient(at 80% 0%, #ff9a76 0px, transparent 50%), radial-gradient(at 60% 70%, #ff5e8a 0px, transparent 50%), radial-gradient(at 0% 100%, #b347d9 0px, transparent 60%)",
  aurora:
    "radial-gradient(at 0% 0%, #5edcff 0px, transparent 50%), radial-gradient(at 100% 20%, #a855f7 0px, transparent 50%), radial-gradient(at 50% 100%, #34d399 0px, transparent 50%)",
  candy:
    "radial-gradient(at 30% 0%, #fec5e5 0px, transparent 60%), radial-gradient(at 100% 60%, #c4b5fd 0px, transparent 60%), radial-gradient(at 0% 100%, #fbcfe8 0px, transparent 60%)",
  matcha:
    "radial-gradient(at 0% 0%, #d6f0a8 0px, transparent 60%), radial-gradient(at 100% 30%, #5eead4 0px, transparent 60%), radial-gradient(at 50% 100%, #facc15 0px, transparent 50%)",
};

export function GradientCard({
  card,
  logo,
  style,
}: PreviewProps & { logo: ReactNode; style: CSSProperties }) {
  const site = card.websiteUrl ?? "";
  const siteHref = site ? (site.startsWith("http") ? site : `https://${site}`) : "";
  const mesh = meshes[card.paletteKey ?? "sunset"] ?? meshes.sunset;

  return (
    <article
      className="card-surface relative flex aspect-[55/91] w-full flex-col gap-4 overflow-hidden rounded-[2rem] border-0 px-7 py-8 shadow-2xl"
      style={{ ...style, backgroundImage: mesh }}
    >
      <div className="flex items-start justify-between gap-3">
        {logo}
        <span className="rounded-full bg-white/30 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-current backdrop-blur">
          @{card.handle}
        </span>
      </div>

      <div className="mt-auto space-y-1">
        <h2 className="text-[2rem] font-bold leading-tight tracking-tight">{card.fullName}</h2>
        {card.lastNameKana || card.firstNameKana ? (
          <p className="text-[10px] tracking-[0.3em] text-current/70">{[card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ")}</p>
        ) : null}
      </div>

      <div className="rounded-[1.5rem] bg-white/40 p-4 text-[11px] leading-relaxed text-current/85 backdrop-blur">
        {card.company ? <p className="font-bold text-current">{card.company}</p> : null}
        {card.department || card.jobTitle ? (
          <p className="text-current/75">{[card.department, card.jobTitle].filter(Boolean).join(" / ")}</p>
        ) : null}
        <div className="mt-1.5 grid gap-1">
          {card.phone ? (
            <p>📞 <a className="hover:underline" href={`tel:${card.phone.replace(/[^0-9+]/g, "")}`}>{card.phone}</a></p>
          ) : null}
          {card.email ? (
            <p className="break-all">✉ <a className="hover:underline" href={`mailto:${card.email}`}>{card.email}</a></p>
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
      </div>

      {card.snsLinks.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {card.snsLinks.map((sns) => (
            <li key={sns.url}>
              <a aria-label={sns.label} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/40 text-current backdrop-blur transition hover:bg-white/60" href={sns.url} rel="noopener noreferrer" target="_blank" title={sns.label}>
                <SnsIcon className="h-3.5 w-3.5" url={sns.url} />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
