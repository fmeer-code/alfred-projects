import Link from "next/link";
import { ensureSeeded } from "@/lib/seed";
import { listProjects } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function Home() {
  ensureSeeded();
  const projects = listProjects();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="mt-1 text-sm text-black">Select a project to view details (read-only).</p>
      </header>

      <div className="grid gap-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.slug}`}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:bg-neutral-50"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-black">{p.description}</div>
              </div>
              <div className="text-xs text-black">{new Date(p.createdAt).toLocaleString()}</div>
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-8 text-xs text-black">
        <span>Global:</span> <Link className="underline" href="/activity">Activity</Link>
        <span className="mx-2">·</span>
        <Link className="underline" href="/health">Health</Link>
      </footer>
    </main>
  );
}
