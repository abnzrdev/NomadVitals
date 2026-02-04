"use client";

export interface DashboardSkeletonProps {
  /** Number of metric cards to show (default 3) */
  cardCount?: number;
  /** Whether to show chart skeletons (default true) */
  showCharts?: boolean;
}

export function DashboardSkeleton({
  cardCount = 3,
  showCharts = true,
}: DashboardSkeletonProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-6"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-slate-700" />
            <div className="mt-3 h-8 w-32 animate-pulse rounded bg-slate-700 sm:mt-4 sm:h-9" />
            <div className="mt-2 h-4 w-16 animate-pulse rounded bg-slate-700" />
          </div>
        ))}
      </div>
      {showCharts && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="h-[200px] rounded-xl border border-slate-700 bg-slate-800 p-4 sm:h-[300px]">
            <div className="mb-3 h-4 w-32 animate-pulse rounded bg-slate-700" />
            <div className="h-[calc(100%-2rem)] animate-pulse rounded bg-slate-700/50" />
          </div>
          <div className="h-[200px] rounded-xl border border-slate-700 bg-slate-800 p-4 sm:h-[300px]">
            <div className="mb-3 h-4 w-28 animate-pulse rounded bg-slate-700" />
            <div className="flex h-[calc(100%-2rem)] items-end gap-1">
              {[45, 70, 55, 80, 60, 75, 50, 65, 85, 55, 72, 58, 78, 62].map((pct, i) => (
                <div
                  key={i}
                  className="flex-1 animate-pulse rounded-t bg-slate-700/50"
                  style={{ height: `${pct}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
