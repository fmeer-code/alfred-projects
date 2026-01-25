import Link from "next/link";
import { ensureSeeded } from "@/lib/seed";
import { getProjectBySlug, getTask } from "@/lib/db";
import { updateTaskAction } from "./actions";

export const dynamic = "force-dynamic";

const Badge = ({ text }: { text: string }) => (
  <span className="inline-flex items-center rounded-full bg-[color:var(--card)] px-2 py-0.5 text-xs">
    {text}
  </span>
);

export default async function TaskPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  ensureSeeded();
  const { slug, id } = await params;
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

  const taskId = Number(id);
  const task = Number.isFinite(taskId) ? getTask(project.id, taskId) : null;
  if (!task) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Not found</h1>
        <p className="mt-2 text-sm">No such task.</p>
        <Link className="mt-4 inline-block underline" href={`/projects/${slug}`}>
          Back
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Task</h1>
          <p className="mt-1 text-sm">Project: {project.name}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge text={`id: ${task.id}`} />
            <Badge text={`status: ${task.status}`} />
            <Badge text={`created: ${new Date(task.createdAt).toLocaleString()}`} />
          </div>
        </div>
        <Link className="text-sm underline" href={`/projects/${slug}`}>
          Back
        </Link>
      </header>

      <form action={updateTaskAction.bind(null, slug, task.id)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold" htmlFor="title">
            Name
          </label>
          <input
            id="title"
            name="title"
            defaultValue={task.title}
            className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-3"
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
            defaultValue={task.description}
            className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-3"
            rows={10}
          />
        </div>

        <button
          type="submit"
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2 font-semibold"
        >
          Save
        </button>
      </form>

      <p className="mt-6 text-xs" style={{ opacity: 0.8 }}>
        Note: status is managed by Alfred for now.
      </p>
    </main>
  );
}
