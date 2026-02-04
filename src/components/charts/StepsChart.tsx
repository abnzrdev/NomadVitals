"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from "recharts";

export type StepsChartDataPoint = {
  date: string;
  steps: number;
};

export type StepsChartProps = {
  data: StepsChartDataPoint[];
  goal: number;
};

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatStepsYAxis(value: number): string {
  if (value >= 1000) {
    return `${value / 1000}K`;
  }
  return String(value);
}

function formatStepsTooltip(value: number): string {
  return value.toLocaleString();
}

type StepsTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{ value?: number }>;
  label?: string | null;
};

function StepsTooltip({
  active,
  payload,
  label,
}: StepsTooltipProps): React.ReactElement | null {
  if (!active || !payload?.length || label == null) return null;
  const steps = payload[0]?.value;
  if (steps === undefined) return null;
  return (
    <div className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-slate-200">
        {formatDateLabel(label)}
      </p>
      <p className="text-sm text-teal-400">
        {formatStepsTooltip(steps)} steps
      </p>
    </div>
  );
}

export function StepsChart({ data, goal }: StepsChartProps): React.ReactElement {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-slate-600)"
          strokeOpacity={0.8}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateLabel}
          stroke="var(--color-slate-600)"
          tick={{ fill: "var(--color-slate-700)", fontSize: 12 }}
          axisLine={{ stroke: "var(--color-slate-600)" }}
          tickLine={{ stroke: "var(--color-slate-600)" }}
        />
        <YAxis
          tickFormatter={formatStepsYAxis}
          stroke="var(--color-slate-600)"
          tick={{ fill: "var(--color-slate-700)", fontSize: 12 }}
          axisLine={{ stroke: "var(--color-slate-600)" }}
          tickLine={{ stroke: "var(--color-slate-600)" }}
        />
        <Tooltip content={<StepsTooltip />} />
        <ReferenceLine
          y={goal}
          stroke="var(--color-slate-500)"
          strokeDasharray="6 4"
          strokeWidth={1.5}
        />
        <Line
          type="monotone"
          dataKey="steps"
          stroke="var(--color-teal-400)"
          strokeWidth={2}
          dot={{ fill: "var(--color-teal-500)", strokeWidth: 0 }}
          activeDot={{
            fill: "var(--color-teal-400)",
            stroke: "var(--color-teal-500)",
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
