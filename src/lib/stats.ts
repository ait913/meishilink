import { prisma } from "@/lib/prisma";
import type { UAClass } from "@/lib/log";

export type StatsResponse = {
  total: number;
  last7d: number;
  last30d: number;
  daily: Array<{ date: string; count: number }>;
  uaBreakdown: { ios: number; android: number; desktop: number; other: number };
};

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getStatsForCard(cardId: string): Promise<StatsResponse> {
  const now = new Date();
  const days30Ago = new Date(now);
  days30Ago.setDate(now.getDate() - 29);
  days30Ago.setHours(0, 0, 0, 0);

  const days7Ago = new Date(now);
  days7Ago.setDate(now.getDate() - 6);
  days7Ago.setHours(0, 0, 0, 0);

  const [total, last7d, last30d, recentHits] = await Promise.all([
    prisma.hit.count({ where: { cardId } }),
    prisma.hit.count({ where: { cardId, ts: { gte: days7Ago } } }),
    prisma.hit.count({ where: { cardId, ts: { gte: days30Ago } } }),
    prisma.hit.findMany({
      where: { cardId, ts: { gte: days30Ago } },
      select: { ts: true, uaClass: true },
      orderBy: { ts: "asc" },
    }),
  ]);

  const dailyMap = new Map<string, number>();
  for (let index = 0; index < 30; index += 1) {
    const value = new Date(days30Ago);
    value.setDate(days30Ago.getDate() + index);
    dailyMap.set(formatDate(value), 0);
  }

  const uaBreakdown = { ios: 0, android: 0, desktop: 0, other: 0 };
  for (const hit of recentHits) {
    const key = formatDate(hit.ts);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);

    const uaClass = (hit.uaClass ?? "other") as UAClass;
    if (uaClass === "ios" || uaClass === "android" || uaClass === "desktop") {
      uaBreakdown[uaClass] += 1;
    } else if (uaClass !== "bot") {
      uaBreakdown.other += 1;
    }
  }

  return {
    total,
    last7d,
    last30d,
    daily: Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count })),
    uaBreakdown,
  };
}

