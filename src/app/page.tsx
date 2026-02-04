import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 font-sans text-slate-100">
      <main className="flex max-w-2xl flex-col items-center gap-8 px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          NomadVitals
        </h1>
        <p className="text-slate-400">
          Your health metrics at a glance.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-xl bg-teal-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-teal-500"
          >
            Open Dashboard
          </Link>
          <Link
            href="/upload"
            className="rounded-xl border border-slate-600 px-6 py-3 text-base font-medium text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800"
          >
            Upload Data
          </Link>
        </div>
      </main>
    </div>
  );
}
