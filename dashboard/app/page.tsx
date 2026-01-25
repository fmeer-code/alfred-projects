import Link from "next/link";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-semibold">{title}</h2>
    <div className="mt-3 text-sm text-neutral-700">{children}</div>
  </section>
);

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Alfred Dashboard (read-only)</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Tasks, projects, and idea board — securely exposed via Cloudflare Tunnel.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Projects">
          <p>
            <Link className="underline" href="/projects">
              View projects
            </Link>
          </p>
          <p className="mt-2 text-xs text-neutral-500">Includes the dashboard project (URLs, tasks, ideas, health).</p>
        </Section>

        <Section title="Tasks">
          <p>Per-project task lists (read-only for now).</p>
        </Section>

        <Section title="Idea board">
          <p>Per-project ideas are stored and displayed read-only for now.</p>
        </Section>

        <Section title="Activity">
          <p>
            <Link className="underline" href="/activity">
              View activity log
            </Link>
          </p>
        </Section>
      </div>

      <footer className="mt-8 text-xs text-neutral-500">
        Health endpoint: <Link className="underline" href="/health">/health</Link>
      </footer>
    </main>
  );
}
