"use client";

import { useMemo } from "react";
import type { ChartDataPoint } from "@/types/dashboard";

export interface SleepChartProps {
  data: ChartDataPoint[];
  /** Optional height in pixels */
  height?: number;
  className?: string;
}

export function SleepChart({ data, height, className = "" }: SleepChartProps) {
  const bars = useMemo(() => {
    if (!data.length) return [];
    const values = data.map((d) => d.value);
    const max = Math.max(...values, 1);
    return data.map((d) => ({
      ...d,
      heightPercent: (d.value / max) * 100,
    }));
  }, [data]);

  const containerClass = `overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-6 ${className}`.trim();

  if (!data.length) {
    return (
      <div
        className={`flex h-full min-h-[200px] items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-500 sm:min-h-[300px] ${className}`}
        style={height != null ? { height } : undefined}
      >
        <span className="text-sm">No sleep data</span>
      </div>
    );
  }

  return (
    <div
      className={containerClass}
      style={height != null ? { height } : undefined}
    >
      <h3 className="mb-3 text-sm font-medium text-slate-300 sm:text-base">Sleep (hours)</h3>
      <div className="flex h-[calc(100%-2rem)] items-end gap-1">
        {bars.map((bar, i) => (
          <div
            key={`${bar.date}-${i}`}
            className="flex-1 rounded-t bg-sky-500/70 transition-all hover:bg-sky-500/90"
            style={{ height: `${bar.heightPercent}%` }}
            title={`${bar.date}: ${bar.value}h`}
            role="img"
            aria-label={`${bar.date} ${bar.value} hours`}
          />
        ))}
      </div>
    </div>
  );
}
