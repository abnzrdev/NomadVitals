# Watch connection checklist for NomadVitals

This doc sums up what’s already there and what you need to do to get your watch data into the project.

---

## What the project does today

- **Data source**: Manual **CSV upload** only (no direct watch or app connection).
- **Expected CSV columns**: `date`, `steps`, `heart_rate`, `sleep_hours` (or aliases like `step_count`, `heart rate`, `sleep`, etc. — see `src/lib/csv.ts`).
- **Flow**: Upload CSV → API parses and validates → Supabase `health_data` → dashboard shows steps, heart rate, sleep.

So “connecting your watch” right now means: **get data out of your watch (or its app) into a CSV that matches this format, then upload it in the app.**

---

## Option A: Use export from your watch app (no code changes)

**Best if:** You have Samsung Health, Google Fit, Garmin Connect, Apple Health, etc., and are okay with manual export + upload.

| Step | What to do |
|------|------------|
| 1 | Sync your watch with its app (Samsung Health, Garmin Connect, etc.). |
| 2 | Export your data from that app. Many apps offer “Export” or “Download my data” and give CSV/Excel. |
| 3 | Make sure the export has **one row per day** with: **date**, **steps**, **heart rate**, **sleep (hours)**. |
| 4 | If column names differ, rename them to match or add a mapping (see “CSV format” below). |
| 5 | In NomadVitals, go to **Upload** and upload the CSV. |
| 6 | Open the **Dashboard** to see the data. |

**CSV format the app accepts (from `src/lib/csv.ts`):**

- **Date**: column named `date` or `day` (formats like `YYYY-MM-DD`, `MM/DD/YYYY`, `DD-MM-YYYY` are supported).
- **Steps**: `steps` or `step_count`.
- **Heart rate**: `heart_rate`, `heartrate`, `heart rate`, or `hr`.
- **Sleep**: `sleep_hours`, `sleep`, or `sleep hours`.

**Samsung Health (Galaxy Watch):**

- Sync the watch with the Samsung Health app.
- Use “Export my data” or any CSV export from Samsung Health if available.
- If the export has different column names, rename them to the ones above (or we can add a Samsung-specific mapper).

---

## Option B: Add real “watch connection” (code changes)

**Best if:** You want automatic or one-click sync from the watch/app instead of manual CSV.

Then “connect my watch” means implementing one of these:

| # | Task | Notes |
|---|------|--------|
| 1 | **Choose how the watch talks to the app** | e.g. Samsung Health SDK, Google Fit / Health Connect (Android), Apple HealthKit (iOS), Garmin Connect API, or continue CSV but from an automated export. |
| 2 | **Auth** | Replace `MOCK_USER_ID` in `src/app/api/upload/route.ts` with real user (e.g. Supabase Auth) so data is per user. |
| 3 | **Backend for watch/app** | Either: (a) mobile app or watch app that sends data to your API, or (b) server that pulls from a provider (e.g. Google Fit API, Samsung Health API) and writes to Supabase. |
| 4 | **API shape** | Reuse or extend the existing `POST /api/upload` (e.g. accept same CSV over HTTP, or add a JSON body with `date`, `steps`, `heart_rate`, `sleep_hours` for a “sync” endpoint). |
| 5 | **Data format** | Keep using the same `health_data` table and validation (steps, heart_rate, sleep_hours per day); any new integration should output that format. |

**Concrete “connect watch” options:**

- **Samsung / Galaxy Watch**: Use Samsung Health SDK or Samsung Health API (if available) to read steps, heart rate, sleep; then send to your backend or export CSV and upload.
- **Android (Wear OS / Google Fit)**: Use **Health Connect** or **Google Fit API** to read data; build a small Android app or backend job that fetches and pushes to your API/Supabase.
- **Apple Watch**: Use **HealthKit** in an iOS app to read the same metrics, then send to your API (e.g. JSON with date + steps + heart_rate + sleep_hours).
- **Garmin / others**: Use their official API or export (e.g. Garmin Connect export) and either manual upload or a script that calls your upload API.

---

## Quick checklist: “What do I need to do to connect my watch?”

- [ ] **Decide:** Manual CSV export (Option A) or automatic sync (Option B)?
- [ ] **If Option A:** Get CSV from your watch’s app with `date`, `steps`, `heart_rate`, `sleep_hours` (or map column names), then use Upload in the project.
- [ ] **If Option B:** Pick integration (Samsung Health, Health Connect, HealthKit, Garmin, etc.), add auth, then implement a sync path (mobile app or server) that writes into `health_data` in the same format the app already uses.

If you tell me your watch brand (e.g. Samsung Galaxy, Garmin, Apple) and whether you prefer “manual CSV” or “automatic sync,” I can narrow this to exact steps and, for Option B, outline the code changes (e.g. new API route, env vars, and where to plug in the watch provider).
