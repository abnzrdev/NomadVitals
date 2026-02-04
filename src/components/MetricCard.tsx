"use client";

import type { MetricSummary } from "@/types/dashboard";

const ICONS: Record<MetricSummary["icon"], React.ReactNode> = {
  steps: (
    <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8h-8m8 0l-8 8" />
    </svg>
  ),
  sleep: (
    <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  heart: (
    <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

function TrendIndicator({
  direction,
  percent,
}: {
  direction: "up" | "down" | "neutral";
  percent: number;
}) {
  if (direction === "neutral") {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-slate-400">
        — <span>{percent}%</span>
      </span>
    );
  }
  const isUp = direction === "up";
  const colorClass = isUp ? "text-emerald-400" : "text-amber-400";
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${colorClass}`}>
      {isUp ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      )}
      <span>{percent}%</span>
    </span>
  );
}

export interface MetricCardProps {
  metric: MetricSummary;
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-slate-300 sm:text-base">{metric.label}</span>
        <span className="hidden shrink-0 sm:block" aria-hidden>
          {ICONS[metric.icon]}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-100 sm:text-3xl lg:text-4xl">
        {metric.formatted}
      </p>
      <div className="mt-2 hidden sm:block">
        <TrendIndicator direction={metric.trend.direction} percent={metric.trend.percent} />
      </div>
    </div>
  );
}
