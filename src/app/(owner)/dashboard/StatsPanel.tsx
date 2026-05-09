"use client";

import type { StatsResponse } from "@/lib/stats";

function buildPolyline(daily: StatsResponse["daily"]) {
  const max = Math.max(...daily.map((entry) => entry.count), 1);
  return daily
    .map((entry, index) => {
      const x = daily.length === 1 ? 0 : (index / (daily.length - 1)) * 100;
      const y = 100 - (entry.count / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");
}

export function StatsPanel({ stats }: { stats: StatsResponse }) {
  return (
    <section className="space-y-5 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-neutral-200/60">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm text-neutral-500">total</p>
          <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
        </div>
        <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm text-neutral-500">last 7d</p>
          <p className="mt-2 text-3xl font-semibold">{stats.last7d}</p>
        </div>
        <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm text-neutral-500">last 30d</p>
          <p className="mt-2 text-3xl font-semibold">{stats.last30d}</p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-medium text-neutral-900">直近 30 日の訪問</p>
          <p className="text-xs text-neutral-500">CSS/SVG 折れ線</p>
        </div>
        <svg className="h-44 w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline fill="none" points={buildPolyline(stats.daily)} stroke="#111111" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {Object.entries(stats.uaBreakdown).map(([label, value]) => (
          <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4" key={label}>
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

