import type { HealthCsvRow } from "@/types/health";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/** Normalize various date inputs to ISO date string (YYYY-MM-DD). */
function toIsoDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Empty date");

  // Already YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const month = m!.padStart(2, "0");
    const day = d!.padStart(2, "0");
    return `${y}-${month}-${day}`;
  }

  // MM/DD/YYYY or M/D/YYYY
  const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    const month = m!.padStart(2, "0");
    const day = d!.padStart(2, "0");
    return `${y}-${month}-${day}`;
  }

  // DD-MM-YYYY
  const euMatch = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(trimmed);
  if (euMatch) {
    const [, d, m, y] = euMatch;
    const month = m!.padStart(2, "0");
    const day = d!.padStart(2, "0");
    return `${y}-${month}-${day}`;
  }

  // Fallback: try Date parsing
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${trimmed}`);
  return date.toISOString().slice(0, 10);
}

function findHeaderIndex(headers: string[], names: string[]): number {
  const lower = headers.map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  for (const name of names) {
    const n = name.toLowerCase().replace(/\s+/g, "_");
    const i = lower.findIndex((h) => h === n || h.replace(/_/g, "") === n.replace(/_/g, ""));
    if (i >= 0) return i;
  }
  return -1;
}

/**
 * Parse CSV text into health rows. Dates are normalized to ISO (YYYY-MM-DD).
 * Does not validate numeric ranges; caller should validate steps, heart_rate, sleep_hours.
 */
export function parseHealthCsv(text: string): HealthCsvRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const rows = lines.map(parseCSVLine);
  const headers = rows[0] ?? [];

  const dateIdx = findHeaderIndex(headers, ["date", "day"]);
  const stepsIdx = findHeaderIndex(headers, ["steps", "step_count"]);
  const heartRateIdx = findHeaderIndex(headers, ["heart_rate", "heartrate", "heart rate", "hr"]);
  const sleepIdx = findHeaderIndex(headers, ["sleep_hours", "sleep", "sleep hours", "sleep_hours"]);

  if (dateIdx < 0) throw new Error("CSV must have a 'date' column");
  if (stepsIdx < 0) throw new Error("CSV must have a 'steps' column");
  if (heartRateIdx < 0) throw new Error("CSV must have a 'heart_rate' column");
  if (sleepIdx < 0) throw new Error("CSV must have a 'sleep_hours' column");

  const result: HealthCsvRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const dateStr = row[dateIdx] ?? "";
    const stepsRaw = row[stepsIdx] ?? "0";
    const hrRaw = row[heartRateIdx] ?? "0";
    const sleepRaw = row[sleepIdx] ?? "0";

    const steps = Math.round(Number(stepsRaw));
    const heart_rate = Math.round(Number(hrRaw));
    const sleep_hours = Number(sleepRaw);

    if (Number.isNaN(steps) || Number.isNaN(heart_rate) || Number.isNaN(sleep_hours)) {
      throw new Error(`Row ${i + 1}: invalid numeric value(s)`);
    }

    result.push({
      date: toIsoDate(dateStr),
      steps,
      heart_rate,
      sleep_hours,
    });
  }
  return result;
}
