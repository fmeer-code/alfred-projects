import Link from "next/link";
import { ensureSeeded } from "@/lib/seed";
import { getProjectBySlug, listIdeas, listTasks } from "@/lib/db";

export const dynamic = "force-dynamic";

const Badge = ({ text }: { text: string }) => (
  <span className="inline-flex items-center rounded-full bg-[color:var(--card)] px-2 py-0.5 text-xs text-[color:var(--foreground)]">
    {text}
  </span>
);

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-sm">
    <h2 className="text-lg font-semibold">{title}</h2>
    <div className="mt-3 text-sm text-[color:var(--foreground)]">{children}</div>
  </section>
);

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  ensureSeeded();
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Not found</h1>
        <p className="mt-2 text-sm text-[color:var(--foreground)]">No such project.</p>
        <Link className="mt-4 inline-block underline" href="/projects">
          Back
        </Link>
      </main>
    );
  }

  const tasks = listTasks(project.id);
  const ideas = listIdeas(project.id);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="mt-1 text-sm text-[color:var(--foreground)]">{project.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge text={`slug: ${project.slug}`} />
            <Badge text={`created: ${new Date(project.createdAt).toLocaleString()}`} />
          </div>
        </div>
        <div className="text-sm">
          <Link className="underline" href="/projects">
            Projects
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="URLs">
          <ul className="list-disc pl-5">
            <li>
              Project URL: <a className="underline" href={project.url}>{project.url}</a>
            </li>
            <li>
              Health: <a className="underline" href={project.healthUrl}>{project.healthUrl}</a>
            </li>
          </ul>
        </Card>

        <Card title="Status">
          <p>This is a read-only dashboard. Editing will come later.</p>
        </Card>

        <Card title="Tasks">
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-start justify-between gap-3 rounded-lg border border-[color:var(--border)] p-3">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-[color:var(--foreground)]">{new Date(t.createdAt).toLocaleString()}</div>
                </div>
                <Badge text={t.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Ideas">
          <div className="space-y-2">
            {ideas.map((i) => (
              <div key={i.id} className="rounded-lg border border-[color:var(--border)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{i.text}</div>
                  <Badge text={i.column} />
                </div>
                <div className="mt-1 text-xs text-[color:var(--foreground)]">{new Date(i.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
