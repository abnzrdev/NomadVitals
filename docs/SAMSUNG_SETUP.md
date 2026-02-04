# Samsung-only setup: connect your Galaxy Watch to NomadVitals

This guide lists **what you need to do** to get data from Samsung Health (Galaxy Watch) into NomadVitals using the Samsung Health Data SDK and the NomadVitals sync API.

---

## Overview

- **Samsung Health Data SDK** runs on **Android only**. It reads steps, heart rate, and sleep from the Samsung Health app (which syncs from your Galaxy Watch).
- NomadVitals provides a **sync API** that your Android app calls to send that data. There is no server-side “Samsung API” that the Next.js backend calls; the flow is: **Phone (Samsung Health SDK) → your Android app → POST to NomadVitals API → Supabase**.

So your tasks are: (1) Samsung developer setup, (2) build or use an Android app that uses the SDK and POSTs to NomadVitals, (3) point the app at your deployed API.

---

## Checklist: what you have to do

### 1. Samsung Developer setup

| Step | What to do |
|------|------------|
| 1.1 | Create a **Samsung Developer** account: [developer.samsung.com](https://developer.samsung.com). |
| 1.2 | Go to **Samsung Health Data SDK**: [developer.samsung.com/health/data](https://developer.samsung.com/health/data/data/overview.html). |
| 1.3 | **Download** the Samsung Health Data SDK (e.g. v1.0.0) and unzip it. |
| 1.4 | Read the **app creation process**: [developer.samsung.com/health/data/process.html](https://developer.samsung.com/health/data/process.html). |

### 2. Enable Samsung Health developer mode (for testing)

| Step | What to do |
|------|------------|
| 2.1 | On your **Android phone**, install/update **Samsung Health**. |
| 2.2 | Turn on **developer mode** in Samsung Health (see [developer mode guide](https://developer.samsung.com/health/data/guide/developer-mode.html)). |
| 2.3 | Use this **only for development**. For real users, you must complete the **partnership request** (see step 4). |

### 3. Build an Android app that uses the SDK and syncs to NomadVitals

| Step | What to do |
|------|------------|
| 3.1 | Create an **Android app** (Android 10 / API 29+). |
| 3.2 | **Add the Samsung Health Data SDK** to the project (use the library from the SDK download). |
| 3.3 | In your app, use the SDK to **read** from Samsung Health: |
|     | • **Steps** – use Step type and aggregate (e.g. total per day). |
|     | • **Heart rate** – use HeartRate type (e.g. average or last of day). |
|     | • **Sleep** – use Sleep type; compute **sleep duration in hours** per day. |
| 3.4 | Build **one record per day** in this shape: `date` (YYYY-MM-DD), `steps`, `heart_rate`, `sleep_hours`. |
| 3.5 | **POST** that data to your NomadVitals sync API (see “Sync API” below). |
| 3.6 | Optional: add a “Sync” button or background job that runs after Samsung Health has new data. |

**Sync API (NomadVitals)**

- **URL:** `https://<your-nomad-vitals-domain>/api/samsung/sync`  
  Example: `https://nomad-vitals.vercel.app/api/samsung/sync`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body (single day):**

```json
{
  "date": "2025-02-04",
  "steps": 5000,
  "heart_rate": 72,
  "sleep_hours": 7.5
}
```

- **Body (multiple days):**

```json
{
  "records": [
    { "date": "2025-02-03", "steps": 6000, "heart_rate": 70, "sleep_hours": 8 },
    { "date": "2025-02-04", "steps": 5000, "heart_rate": 72, "sleep_hours": 7.5 }
  ]
}
```

- **Success:** `200` with `{ "success": true, "count": 1 }` (or count of records).
- **Error:** `4xx/5xx` with `{ "success": false, "error": "message" }`.

If a record for the same `user_id` and `date` already exists, it will be **updated** (upsert).

### 4. Partnership request (for distribution without developer mode)

| Step | What to do |
|------|------------|
| 4.1 | If you want to **distribute** your app so it works **without** Samsung Health developer mode, submit a **partnership request**: [Partnership Request](https://developer.samsung.com/health/partnership.html) (or link from the [process](https://developer.samsung.com/health/data/process.html) page). |
| 4.2 | After approval, register your app’s **package name** and **signing certificate (SHA-256)** in Samsung’s system. |
| 4.3 | **Writing** data to Samsung Health requires a separate access/partnership path; for NomadVitals you only need **read** access (steps, heart rate, sleep). |

### 5. NomadVitals backend (what’s already done)

| Item | Status |
|------|--------|
| Sync API | Implemented: `POST /api/samsung/sync` accepts JSON and upserts into `health_data`. |
| Validation | Same rules as CSV: `steps >= 0`, `heart_rate` 30–220, `sleep_hours` 0–24, `date` YYYY-MM-DD. |
| User ID | Currently a fixed mock user; replace with real auth (e.g. Supabase Auth) when you add login. |

### 6. Deploy and configure

| Step | What to do |
|------|------------|
| 6.1 | **Deploy** NomadVitals (e.g. Vercel) so you have a public base URL. |
| 6.2 | In your Android app, set the **sync endpoint** to `https://<your-domain>/api/samsung/sync`. |
| 6.3 | Ensure **Supabase** env vars are set in the NomadVitals project (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` or service role as needed). |

---

## Quick reference: Samsung Health Data SDK

- **Overview:** [developer.samsung.com/health/data/overview.html](https://developer.samsung.com/health/data/overview.html)
- **Data access (read/aggregate):** [developer.samsung.com/health/data/guide/features/data-access.html](https://developer.samsung.com/health/data/guide/features/data-access.html)
- **App creation process:** [developer.samsung.com/health/data/process.html](https://developer.samsung.com/health/data/process.html)
- **Developer mode:** [developer.samsung.com/health/data/guide/developer-mode.html](https://developer.samsung.com/health/data/guide/developer-mode.html)
- **Code lab (steps):** [Build a health app with steps from Samsung Health](https://developer.samsung.com/codelab/health/steps-data.html)
- **Code lab (sleep):** [Access rich sleep data from Samsung Health](https://developer.samsung.com/codelab/health/sleep-data.html)

---

## Summary

| # | What you do |
|---|-------------|
| 1 | Samsung Developer account + download Samsung Health Data SDK. |
| 2 | Enable Samsung Health developer mode on your phone (for testing). |
| 3 | Build an Android app: SDK → read steps, heart rate, sleep → aggregate by day → POST to `POST /api/samsung/sync`. |
| 4 | For distribution: submit partnership request and register app. |
| 5 | Deploy NomadVitals and point the Android app at your `/api/samsung/sync` URL. |

After that, data from your Galaxy Watch (via Samsung Health) will sync into NomadVitals and show on the dashboard.
