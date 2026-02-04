"use client";

import { useState, useEffect, useMemo } from "react";
import type {
  DashboardData,
  MetricSummary,
  MetricTrend,
  UseDashboardDataResult,
  ChartDataPoint,
} from "@/types/dashboard";

/** Format steps with locale (e.g. 12,345) */
function formatSteps(value: number): string {
  return value.toLocaleString();
}

/** Format sleep hours (e.g. 7.5) */
function formatSleepHours(value: number): string {
  return value.toFixed(1);
}

/** Format heart rate (e.g. 72 bpm) */
function formatHeartRate(value: number): string {
  return `${value} bpm`;
}

/** Build metric summary for a card */
function toMetricSummary(
  label: string,
  value: number,
  formatted: string,
  trend: MetricTrend,
  icon: MetricSummary["icon"]
): MetricSummary {
  return { label, value, formatted, trend, icon };
}

/** Generate mock chart data for the last N days */
function generateMockChartData(
  baseValue: number,
  variance: number,
  days: number
): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const noise = (Math.random() - 0.5) * 2 * variance;
    points.push({
      date: d.toISOString().slice(0, 10),
      value: Math.round(Math.max(0, baseValue + noise)),
    });
  }
  return points;
}

/** Simulated fetch – replace with real API call */
async function fetchDashboardData(): Promise<DashboardData> {
  await new Promise((r) => setTimeout(r, 1200));

  const stepsToday = 8420;
  const stepsHistory = generateMockChartData(8000, 2000, 14);
  const sleepHoursToday = 7.2;
  const sleepHistory = generateMockChartData(7, 1.5, 14).map((p) => ({
    ...p,
    value: Math.round(p.value * 10) / 10,
  }));
  const heartRateBpm = 68;

  return {
    stepsToday,
    stepsTrend: { direction: "up", percent: 12, label: "vs yesterday" },
    stepsHistory,
    sleepHoursToday,
    sleepTrend: { direction: "down", percent: 5, label: "vs yesterday" },
    sleepHistory,
    heartRateBpm,
    heartRateTrend: { direction: "neutral", percent: 0, label: "resting" },
  };
}

/**
 * Fetches dashboard data and derives metrics for cards and charts.
 * Returns loading state and derived metric summaries.
 */
export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchDashboardData()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo((): UseDashboardDataResult["metrics"] => {
    if (!data) return null;
    return {
      steps: toMetricSummary(
        "Steps today",
        data.stepsToday,
        formatSteps(data.stepsToday),
        data.stepsTrend,
        "steps"
      ),
      sleep: toMetricSummary(
        "Sleep today",
        data.sleepHoursToday,
        `${formatSleepHours(data.sleepHoursToday)} hrs`,
        data.sleepTrend,
        "sleep"
      ),
      heartRate: toMetricSummary(
        "Heart rate",
        data.heartRateBpm,
        formatHeartRate(data.heartRateBpm),
        data.heartRateTrend,
        "heart"
      ),
    };
  }, [data]);

  const stepsChartData = useMemo(
    () => data?.stepsHistory ?? [],
    [data?.stepsHistory]
  );
  const sleepChartData = useMemo(
    () => data?.sleepHistory ?? [],
    [data?.sleepHistory]
  );

  return {
    data,
    metrics,
    stepsChartData,
    sleepChartData,
    isLoading,
    error,
  };
}
