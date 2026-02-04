import { z } from "zod";
import type { HealthData } from "@/lib/csvParser";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = "text/csv";

/** ISO date string (YYYY-MM-DD). */
const isoDateString = z
  .string()
  .refine(
    (val) => /^\d{4}-\d{2}-\d{2}$/.test(val) && !Number.isNaN(Date.parse(val)),
    { message: "Invalid ISO date string (YYYY-MM-DD)" }
  );

/** Validates an uploaded file: required, < 10MB, MIME type text/csv. */
export const fileSchema = z
  .instanceof(File, { message: "A file is required" })
  .refine((file) => file.size < MAX_FILE_SIZE_BYTES, {
    message: `File size must be less than 10MB`,
  })
  .refine((file) => file.type === ALLOWED_MIME, {
    message: `File must be ${ALLOWED_MIME}`,
  });

/** Single health record: date, steps >= 0, heartRate 30–220, sleepHours 0–24. */
export const healthDataSchema = z.object({
  date: isoDateString,
  steps: z.number().min(0, "steps must be >= 0"),
  heartRate: z.number().min(30, "heartRate must be >= 30").max(220, "heartRate must be <= 220"),
  sleepHours: z.number().min(0, "sleepHours must be >= 0").max(24, "sleepHours must be <= 24"),
});

/** Array of health records: between 1 and 1000 entries. */
export const healthDataArraySchema = z
  .array(healthDataSchema)
  .min(1, "At least one health record is required")
  .max(1000, "At most 1000 health records allowed");

/**
 * Validates unknown input as HealthData[].
 * On success returns { success: true, data }.
 * On failure returns { success: false, errors: string[] }.
 */
export function validateHealthData(input: unknown): {
  success: boolean;
  data?: HealthData[];
  errors?: string[];
} {
  const result = healthDataArraySchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: string[] = result.error.errors.map((e) =>
    e.path.length ? `${e.path.join(".")}: ${e.message}` : e.message
  );
  return { success: false, errors };
}
