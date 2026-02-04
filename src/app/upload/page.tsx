"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  "text/csv": [".csv"],
  "application/csv": [".csv"],
  "text/plain": [".csv"],
};
const PREVIEW_ROW_COUNT = 5;

type ParseResult = {
  rows: string[][];
  headers: string[];
};

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

function parseCSV(text: string): ParseResult {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) {
    return { rows: [], headers: [] };
  }
  const rows = lines.map(parseCSVLine);
  const headers = rows[0] ?? [];
  return { rows, headers };
}

export default function UploadPage() {
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dropzoneError, setDropzoneError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setDropzoneError(null);
      setParseError(null);
      setParsedData(null);

      if (fileRejections.length > 0) {
        const first = fileRejections[0];
        const msg = first?.errors[0]?.message ?? "File rejected";
        setDropzoneError(msg);
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setIsParsing(true);

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        try {
          const result = parseCSV(text);
          setParsedData(result);
        } catch {
          setParseError("Failed to parse CSV");
        }
        setIsParsing(false);
      };
      reader.onerror = () => {
        setParseError("Failed to read file");
        setIsParsing(false);
      };
      reader.readAsText(file, "UTF-8");
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    multiple: false,
    disabled: isParsing,
  });

  const handleSaveToDatabase = useCallback(async () => {
    if (!parsedData || isSaving) return;
    setIsSaving(true);
    try {
      // Placeholder for API call – wire to your backend later
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setParsedData(null);
    } finally {
      setIsSaving(false);
    }
  }, [parsedData, isSaving]);

  const previewRows = parsedData?.rows.slice(0, PREVIEW_ROW_COUNT) ?? [];
  const headers = parsedData?.headers ?? [];
  const isLoading = isParsing || isSaving;
  const canSave = parsedData != null && !isLoading;
  const hasError = Boolean(dropzoneError || parseError);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
            Health Data Upload
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Upload a CSV file (max 10MB) to import your health data.
          </p>
        </header>

        <section
          {...getRootProps()}
          className={`
            rounded-lg border-2 border-dashed p-6 text-center transition-colors sm:p-8
            ${isDragActive ? "border-teal-500 bg-teal-500/10" : "border-slate-600 text-slate-400"}
            ${hasError ? "border-red-500 bg-red-500/5" : ""}
            ${!hasError && !isDragActive ? "hover:border-slate-500 hover:text-slate-300" : ""}
            ${isParsing ? "pointer-events-none opacity-70" : "cursor-pointer"}
          `}
        >
          <input {...getInputProps()} />
          {isParsing ? (
            <p className="text-slate-300">Reading and parsing file…</p>
          ) : (
            <p className="text-sm sm:text-base">
              {isDragActive
                ? "Drop your CSV here…"
                : "Drag and drop a CSV here, or click to select"}
            </p>
          )}
        </section>

        {(dropzoneError || parseError) && (
          <div
            className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {dropzoneError ?? parseError}
          </div>
        )}

        {previewRows.length > 0 && (
          <section className="mt-6 sm:mt-8">
            <h2 className="mb-3 text-base font-medium text-slate-200 sm:text-lg">
              Preview (first {PREVIEW_ROW_COUNT} rows)
            </h2>
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="min-w-full border-collapse bg-slate-800 text-left text-sm">
                <thead>
                  <tr>
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className="border-b border-slate-700 px-3 py-2.5 font-medium text-slate-300 sm:px-4"
                      >
                        {h || `Column ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={
                        rowIdx % 2 === 0 ? "bg-slate-800" : "bg-slate-800/80"
                      }
                    >
                      {headers.map((_, colIdx) => (
                        <td
                          key={colIdx}
                          className="whitespace-nowrap border-b border-slate-700 px-3 py-2 text-slate-300 sm:px-4"
                        >
                          {row[colIdx] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="mt-6 flex flex-col gap-4 sm:mt-8">
          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={!canSave}
            className="
              w-full rounded-lg bg-teal-600 px-4 py-3 text-sm font-medium text-white
              transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50
              sm:w-auto sm:px-5 sm:py-2.5 sm:text-base
            "
          >
            {isSaving ? "Saving…" : "Save to Database"}
          </button>
        </div>
      </div>
    </div>
  );
}
