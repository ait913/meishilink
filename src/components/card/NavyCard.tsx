import type { CSSProperties, ReactNode } from "react";

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
  const fullKana = [card.lastNameKana, card.firstNameKana].filter(Boolean).join(" ");

  return (
    <article
      className="card-surface relative flex aspect-[55/91] w-full flex-col gap-5 overflow-hidden rounded-[1.25rem] border px-6 py-7"
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
        {fullKana ? (
          <p className="text-[10px] tracking-[0.28em] text-current/60">{romanize(card.lastName, card.firstName)}</p>
        ) : (
          <p className="text-[10px] tracking-[0.28em] text-current/60">{romanize(card.lastName, card.firstName)}</p>
        )}
      </div>

      <div className="space-y-1.5 text-[11px] leading-relaxed text-current/85">
        {card.company ? <p className="font-medium text-current">{card.company}</p> : null}
        {card.department ? <p className="text-current/70">{card.department}</p> : null}
        {card.address || card.postalCode ? (
          <>
            {card.postalCode ? <p>〒{card.postalCode}</p> : null}
            {card.address ? <p>{card.address}</p> : null}
          </>
        ) : null}
        {card.phone ? <p>tel. {card.phone}</p> : null}
        {card.email ? <p className="break-all">mail. {card.email}</p> : null}
        {card.websiteUrl ? <p className="break-all">{card.websiteUrl.replace(/^https?:\/\//, "")}</p> : null}
      </div>

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
