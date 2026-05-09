import type { MetadataRoute } from "next";

const baseUrl = process.env.PUBLIC_BASE_URL ?? "https://meishilink.appily.run";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/onboarding", "/settings", "/saved", "/api/", "/uploads/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
