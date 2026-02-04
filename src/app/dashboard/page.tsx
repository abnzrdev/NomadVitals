"use client";

import { useDashboardData } from "@/lib/useDashboardData";
import { MetricCard } from "@/components/MetricCard";
import { StepsChart } from "@/components/StepsChart";
import { SleepChart } from "@/components/SleepChart";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";

export default function DashboardPage() {
  const {
    metrics,
    stepsChartData,
    sleepChartData,
    isLoading,
    error,
  } = useDashboardData();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-1 hidden text-sm text-slate-400 sm:block">
            Your health metrics at a glance.
          </p>
        </header>

        {error && (
          <div
            className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {error.message}
          </div>
        )}

        {isLoading ? (
          <DashboardSkeleton cardCount={3} showCharts />
        ) : metrics ? (
          <>
            <section
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
              aria-label="Today&apos;s metrics"
            >
              <MetricCard metric={metrics.steps} />
              <MetricCard metric={metrics.sleep} />
              <MetricCard metric={metrics.heartRate} />
            </section>

            <section
              className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2"
              aria-label="Charts"
            >
              <div className="h-[200px] sm:h-[300px]">
                <StepsChart data={stepsChartData} className="h-full" />
              </div>
              <div className="h-[200px] sm:h-[300px]">
                <SleepChart data={sleepChartData} className="h-full" />
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">
            No data available. Upload health data to see your dashboard.
          </div>
        )}
      </div>
    </div>
  );
}
