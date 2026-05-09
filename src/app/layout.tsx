import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/Toast";

import "@/app/globals.css";

const baseUrl = process.env.PUBLIC_BASE_URL ?? "https://meishilink.appily.run";
const siteName = "MeishiLink";
const description =
  "紙名刺をデジタルに。あなた専用の公開 URL、QR コード、vCard、ローカル保存を一つの導線にまとめた Web 名刺サービス。閲覧者の登録は不要です。";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "MeishiLink — 紙名刺をデジタルに。Web 名刺サービス",
    template: "%s | MeishiLink",
  },
  description,
  applicationName: siteName,
  keywords: ["Web 名刺", "デジタル名刺", "QR 名刺", "vCard", "MeishiLink", "名刺管理", "オンライン名刺"],
  authors: [{ name: "MeishiLink" }],
  creator: "MeishiLink",
  publisher: "MeishiLink",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: baseUrl,
    siteName,
    title: "MeishiLink — 紙名刺をデジタルに。",
    description,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "MeishiLink — 紙名刺をデジタルに。",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MeishiLink — 紙名刺をデジタルに。",
    description,
    images: ["/og-default.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: baseUrl,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: baseUrl,
    inLanguage: "ja-JP",
    description,
  };

  return (
    <html lang="ja">
      <body className="app-shell font-sans text-neutral-950 antialiased">
        <ToastProvider>{children}</ToastProvider>
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
