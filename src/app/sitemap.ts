import type { MetadataRoute } from "next";

const baseUrl = process.env.PUBLIC_BASE_URL ?? "https://meishilink.appily.run";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${baseUrl}/`, lastModified: now, priority: 1.0, changeFrequency: "weekly" },
    { url: `${baseUrl}/login`, lastModified: now, priority: 0.5, changeFrequency: "yearly" },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${baseUrl}/legal/terms`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
  ];
}
