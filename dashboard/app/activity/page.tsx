import Link from "next/link";
import { ensureSeeded } from "@/lib/seed";
import { listEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function ActivityPage() {
  ensureSeeded();
  const events = listEvents(100);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="mt-1 text-sm text-neutral-600">Recent changes (read-only).</p>
        </div>
        <Link className="text-sm underline" href="/">
          Home
        </Link>
      </header>

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="divide-y divide-neutral-200">
          {events.map((e) => (
            <div key={e.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{e.kind}</div>
                <div className="text-xs text-neutral-500">{new Date(e.ts).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-sm text-neutral-700">{e.message}</div>
            </div>
          ))}
          {events.length === 0 && <div className="p-4 text-sm text-neutral-600">No events yet.</div>}
        </div>
      </div>
    </main>
  );
}
