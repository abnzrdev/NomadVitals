import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/** Mock user ID until auth is wired; replace with session/user or Samsung user mapping. */
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type SamsungHealthRecord = {
  date: string;
  steps: number;
  heart_rate: number;
  sleep_hours: number;
};

function isValidDate(dateStr: string): boolean {
  if (!ISO_DATE.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !Number.isNaN(d.getTime());
}

function validateRecord(
  record: unknown,
  index: number
): { ok: true; row: SamsungHealthRecord } | { ok: false; error: string } {
  if (record == null || typeof record !== "object" || Array.isArray(record)) {
    return { ok: false, error: `Record ${index + 1}: must be an object` };
  }
  const r = record as Record<string, unknown>;
  const date = typeof r.date === "string" ? r.date.trim() : "";
  const steps = typeof r.steps === "number" ? r.steps : Number(r.steps);
  const heart_rate =
    typeof r.heart_rate === "number" ? r.heart_rate : Number(r.heart_rate);
  const sleep_hours =
    typeof r.sleep_hours === "number" ? r.sleep_hours : Number(r.sleep_hours);

  if (!date || !isValidDate(date)) {
    return { ok: false, error: `Record ${index + 1}: invalid or missing date (use YYYY-MM-DD)` };
  }
  if (Number.isNaN(steps) || steps < 0) {
    return { ok: false, error: `Record ${index + 1}: steps must be a number >= 0` };
  }
  if (Number.isNaN(heart_rate) || heart_rate < 30 || heart_rate > 220) {
    return {
      ok: false,
      error: `Record ${index + 1}: heart_rate must be between 30 and 220`,
    };
  }
  if (
    Number.isNaN(sleep_hours) ||
    sleep_hours < 0 ||
    sleep_hours > 24
  ) {
    return {
      ok: false,
      error: `Record ${index + 1}: sleep_hours must be between 0 and 24`,
    };
  }

  return {
    ok: true,
    row: {
      date,
      steps: Math.round(steps),
      heart_rate: Math.round(heart_rate),
      sleep_hours: Number(sleep_hours.toFixed(2)),
    },
  };
}

/**
 * POST /api/samsung/sync
 *
 * Accepts JSON body from an Android app using Samsung Health Data SDK.
 * Body: { "records": [ { "date": "YYYY-MM-DD", "steps", "heart_rate", "sleep_hours" }, ... ] }
 * or    { "date", "steps", "heart_rate", "sleep_hours" } for a single record.
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    const body = await request.json();
    let records: unknown[];

    if (Array.isArray(body.records)) {
      records = body.records;
    } else if (
      body != null &&
      typeof body === "object" &&
      typeof body.date === "string" &&
      (typeof body.steps === "number" || typeof body.steps === "string") &&
      (typeof body.heart_rate === "number" || typeof body.heart_rate === "string") &&
      (typeof body.sleep_hours === "number" || typeof body.sleep_hours === "string")
    ) {
      records = [body];
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            "Body must be { records: [...] } or a single { date, steps, heart_rate, sleep_hours }",
        },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one record is required" },
        { status: 400 }
      );
    }

    const rows: SamsungHealthRecord[] = [];
    for (let i = 0; i < records.length; i++) {
      const result = validateRecord(records[i], i);
      if (!result.ok) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }
      rows.push(result.row);
    }

    const insertRows = rows.map((row) => ({
      user_id: MOCK_USER_ID,
      date: row.date,
      steps: row.steps,
      heart_rate: row.heart_rate,
      sleep_hours: row.sleep_hours,
    }));

    const { error } = await supabase.from("health_data").upsert(insertRows, {
      onConflict: "user_id,date",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error("Samsung sync Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save data" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, count: insertRows.length },
      { status: 200 }
    );
  } catch (err) {
    console.error("Samsung sync API error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
