"use client";

import { useMemo } from "react";
import type { ChartDataPoint } from "@/types/dashboard";

export interface StepsChartProps {
  data: ChartDataPoint[];
  /** Optional height in pixels */
  height?: number;
  className?: string;
}

export function StepsChart({ data, height, className = "" }: StepsChartProps) {
  const { path, minY, maxY, points } = useMemo(() => {
    if (!data.length) return { path: "", minY: 0, maxY: 100, points: [] };
    const values = data.map((d) => d.value);
    const minY = Math.min(...values, 0);
    const maxY = Math.max(...values) * 1.1 || 1;
    const range = maxY - minY;
    const w = 100;
    const h = 100;
    const stepX = data.length <= 1 ? 0 : w / (data.length - 1);
    const points = data.map((d, i) => ({
      x: i * stepX,
      y: h - ((d.value - minY) / range) * h,
      value: d.value,
      date: d.date,
    }));
    const d = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
    return { path: d, minY, maxY, points };
  }, [data]);

  const containerClass = `overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-6 ${className}`.trim();

  if (!data.length) {
    return (
      <div
        className={`flex h-full min-h-[200px] items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-500 sm:min-h-[300px] ${className}`}
        style={height != null ? { height } : undefined}
      >
        <span className="text-sm">No steps data</span>
      </div>
    );
  }

  return (
    <div
      className={containerClass}
      style={height != null ? { height } : undefined}
    >
      <h3 className="mb-3 text-sm font-medium text-slate-300 sm:text-base">Steps over time</h3>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-[calc(100%-2rem)] w-full"
        aria-label="Steps line chart"
      >
        <defs>
          <linearGradient id="stepsGradient" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor="rgb(56 189 248)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(56 189 248)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L 100 100 L 0 100 Z`}
          fill="url(#stepsGradient)"
        />
        <path
          d={path}
          fill="none"
          stroke="rgb(56 189 248)"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
