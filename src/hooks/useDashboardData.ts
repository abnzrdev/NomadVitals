import { useState, useEffect, useMemo, useCallback } from "react";
import { getHealthData, type HealthData } from "@/lib/healthData";

const STEPS_GOAL = 10_000;

export interface UseDashboardDataResult {
  data: HealthData[] | null;
  loading: boolean;
  error: Error | null;
  avgSteps: number;
  avgHeartRate: number;
  avgSleep: number;
  currentStreak: number;
  refetch: () => void;
}

/** Computes the consecutive-day streak meeting the steps goal, counting backward from the most recent date. */
function computeCurrentStreak(data: HealthData[]): number {
  if (data.length === 0) return 0;

  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
  const mostRecent = sorted[0];
  if (!mostRecent || mostRecent.steps < STEPS_GOAL) return 0;

  let streak = 0;
  let expectedDate = mostRecent.date;

  for (const record of sorted) {
    if (record.date !== expectedDate) break;
    if (record.steps < STEPS_GOAL) break;

    streak++;
    const prev = new Date(expectedDate);
    prev.setDate(prev.getDate() - 1);
    expectedDate = prev.toISOString().slice(0, 10);
  }

  return streak;
}

/** Data fetching hook for dashboard health metrics. */
export function useDashboardData(days: number = 30): UseDashboardDataResult {
  const [data, setData] = useState<HealthData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    getHealthData(days)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getHealthData(days)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const avgSteps = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, d) => sum + d.steps, 0) / data.length;
  }, [data]);

  const avgHeartRate = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, d) => sum + d.heartRate, 0) / data.length;
  }, [data]);

  const avgSleep = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, d) => sum + d.sleepHours, 0) / data.length;
  }, [data]);

  const currentStreak = useMemo(() => {
    if (!data) return 0;
    return computeCurrentStreak(data);
  }, [data]);

  return {
    data,
    loading,
    error,
    avgSteps,
    avgHeartRate,
    avgSleep,
    currentStreak,
    refetch: fetchData,
  };
}
