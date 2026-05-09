import Link from "next/link";
import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { MeishiLogo } from "@/components/icons/MeishiLogo";

export default function LegalLayout({ children }: { children: ReactNode }) {
  const operatorUrl = process.env.OPERATOR_INFO_URL ?? "";

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-10 flex items-center justify-between gap-4">
        <Link className="flex items-center gap-3" href="/">
          <MeishiLogo />
          <div>
            <p className="text-sm text-neutral-500">Web business card</p>
            <h1 className="text-xl font-semibold">MeishiLink</h1>
          </div>
        </Link>
      </header>

      <article className="prose prose-neutral max-w-none rounded-[2rem] border border-white/70 bg-white/85 px-8 py-10 shadow-sm backdrop-blur [&_h1]:mt-0 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_p]:my-3 [&_p]:leading-relaxed [&_p]:text-neutral-700 [&_ol]:my-3 [&_ul]:my-3 [&_li]:my-1 [&_li]:text-neutral-700 [&_a]:text-neutral-950 [&_a]:underline">
        {children}
      </article>

      <Footer operatorUrl={operatorUrl} />
    </main>
  );
}
