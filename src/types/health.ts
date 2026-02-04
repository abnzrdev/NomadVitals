/** Single row of health data as parsed from CSV (dates already normalized to ISO). */
export type HealthCsvRow = {
  date: string; // ISO date string (YYYY-MM-DD)
  steps: number;
  heart_rate: number;
  sleep_hours: number;
};
