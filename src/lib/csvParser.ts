import Papa from "papaparse";

export type HealthData = {
  date: string;
  steps: number;
  heartRate: number;
  sleepHours: number;
};

const REQUIRED_HEADERS = ["date", "steps", "heartRate", "sleepHours"] as const;

function hasAllFields(
  row: Record<string, string | undefined>
): row is Record<(typeof REQUIRED_HEADERS)[number], string> {
  return REQUIRED_HEADERS.every((h) => row[h] != null && String(row[h]).trim() !== "");
}

function isValidDate(dateStr: string): boolean {
  const parsed = new Date(dateStr);
  return !Number.isNaN(parsed.getTime());
}

export function parseHealthCsv(file: File): Promise<HealthData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const papaErrors = results.errors;
        if (papaErrors.length > 0) {
          const message = papaErrors.map((e) => e.message).join("; ") || "CSV parsing failed.";
          reject(new Error(message));
          return;
        }

        const data = (results.data ?? []) as Record<string, string | undefined>[];
        const validRows: HealthData[] = [];

        for (const row of data) {
          if (!hasAllFields(row)) continue;

          const steps = Number(row.steps);
          const heartRate = Number(row.heartRate);
          const sleepHours = Number(row.sleepHours);

          if (
            Number.isNaN(steps) ||
            Number.isNaN(heartRate) ||
            Number.isNaN(sleepHours) ||
            !isValidDate(row.date)
          ) {
            continue;
          }

          validRows.push({
            date: row.date.trim(),
            steps,
            heartRate,
            sleepHours,
          });
        }

        if (validRows.length === 0) {
          reject(
            new Error(
              "The CSV is empty or malformed: no valid rows with date, steps, heartRate, and sleepHours found."
            )
          );
          return;
        }

        resolve(validRows);
      },
      error(err) {
        reject(new Error(err?.message ?? "CSV parsing failed."));
      },
    });
  });
}
