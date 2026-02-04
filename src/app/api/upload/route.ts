import { NextResponse } from "next/server";
import { parseHealthCsv } from "@/lib/csv";
import { supabase } from "@/lib/supabase";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = "text/csv";

/** Mock user ID until auth is wired; replace with session/user from auth. */
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";

function validateRow(
  row: { date: string; steps: number; heart_rate: number; sleep_hours: number },
  rowIndex: number
): string | null {
  if (row.steps < 0) return `Row ${rowIndex + 1}: steps must be >= 0`;
  if (row.heart_rate < 30 || row.heart_rate > 220) {
    return `Row ${rowIndex + 1}: heart_rate must be between 30 and 220`;
  }
  if (row.sleep_hours < 0 || row.sleep_hours > 24) {
    return `Row ${rowIndex + 1}: sleep_hours must be between 0 and 24`;
  }
  return null;
}

export async function POST(request: Request) {
  // TODO: Add rate limiting (e.g. by IP or user) before processing uploads.
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (file == null || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Missing file. Send a 'file' field with the CSV." },
        { status: 400 }
      );
    }

    if (file.size >= MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File must be smaller than 10MB" },
        { status: 400 }
      );
    }

    const mime = file.type?.toLowerCase() ?? "";
    if (mime !== ALLOWED_MIME) {
      return NextResponse.json(
        { success: false, error: "File must be text/csv" },
        { status: 400 }
      );
    }

    const text = await file.text();
    let rows: Awaited<ReturnType<typeof parseHealthCsv>>;
    try {
      rows = parseHealthCsv(text);
    } catch (parseErr) {
      const message = parseErr instanceof Error ? parseErr.message : "Invalid CSV format";
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row === undefined) continue;
      const err = validateRow(row, i);
      if (err) {
        return NextResponse.json(
          { success: false, error: err },
          { status: 400 }
        );
      }
    }

    const insertRows = rows.map((row) => ({
      user_id: MOCK_USER_ID,
      date: row.date,
      steps: row.steps,
      heart_rate: row.heart_rate,
      sleep_hours: row.sleep_hours,
    }));

    const { error } = await supabase.from("health_data").insert(insertRows);

    if (error) {
      console.error("Supabase insert error:", error);
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
    console.error("Upload API error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
