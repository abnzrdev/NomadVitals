/** Single data point for time-series charts */
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

/** Trend direction for metric cards */
export type TrendDirection = "up" | "down" | "neutral";

/** Trend indicator for a metric */
export interface MetricTrend {
  direction: TrendDirection;
  percent: number;
  label?: string;
}

/** Today's metric summary (steps, sleep, heart rate) */
export interface MetricSummary {
  label: string;
  value: number;
  formatted: string;
  trend: MetricTrend;
  icon: "steps" | "sleep" | "heart";
}

/** Raw/API dashboard data shape */
export interface DashboardData {
  stepsToday: number;
  stepsTrend: MetricTrend;
  stepsHistory: ChartDataPoint[];
  sleepHoursToday: number;
  sleepTrend: MetricTrend;
  sleepHistory: ChartDataPoint[];
  heartRateBpm: number;
  heartRateTrend: MetricTrend;
}

/** Result of useDashboardData hook */
export interface UseDashboardDataResult {
  data: DashboardData | null;
  metrics: {
    steps: MetricSummary;
    sleep: MetricSummary;
    heartRate: MetricSummary;
  } | null;
  stepsChartData: ChartDataPoint[];
  sleepChartData: ChartDataPoint[];
  isLoading: boolean;
  error: Error | null;
}
