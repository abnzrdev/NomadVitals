import { supabase } from "./supabase";

/** Single day of health metrics (matches frontend usage). */
export interface HealthData {
  date: string;
  steps: number;
  heartRate: number;
  sleepHours: number;
}

/** Fetches the last `days` of health data for the current user from Supabase. */
export async function getHealthData(days: number = 30): Promise<HealthData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("health_data")
    .select("date, steps, heart_rate, sleep_hours")
    .gte("date", startStr)
    .order("date", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    date: row.date,
    steps: row.steps,
    heartRate: row.heart_rate,
    sleepHours: Number(row.sleep_hours),
  }));
}
