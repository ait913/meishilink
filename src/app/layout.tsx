import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "MeishiLink",
  description: "紙名刺をデジタルに変える Web 名刺アプリ",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body className="app-shell font-sans text-neutral-950 antialiased">{children}</body>
    </html>
  );
}
