import Link from "next/link";
import { ensureSeeded } from "@/lib/seed";
import { getProjectBySlug } from "@/lib/db";
import { createTaskAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewTaskPage({ params }: { params: Promise<{ slug: string }> }) {
  ensureSeeded();
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Not found</h1>
        <p className="mt-2 text-sm">No such project.</p>
        <Link className="mt-4 inline-block underline" href="/">
          Home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">New task</h1>
          <p className="mt-1 text-sm">Project: {project.name}</p>
        </div>
        <Link className="text-sm underline" href={`/projects/${slug}`}>
          Back
        </Link>
      </header>

      <form action={createTaskAction.bind(null, slug)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold" htmlFor="title">
            Name
          </label>
          <input
            id="title"
            name="title"
            className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-3"
            placeholder="e.g. Add refresh button"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold" htmlFor="description">
            Detailed description
          </label>
          <textarea
            id="description"
            name="description"
            className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-3"
            rows={8}
            placeholder="What should be done? Any details/requirements?"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2 font-semibold"
        >
          Create
        </button>
      </form>
    </main>
  );
}
