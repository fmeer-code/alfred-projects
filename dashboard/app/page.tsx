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
          Internal status board: tasks, projects, and an idea board.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Tasks">
          <ul className="list-disc pl-5">
            <li>Gateway running as systemd user service</li>
            <li>Email bridge: Gmail send + inbox poll → Telegram</li>
            <li>Dashboard: MVP scaffolding (Next.js)</li>
          </ul>
        </Section>

        <Section title="Projects">
          <ul className="list-disc pl-5">
            <li>Alfred setup on Ubuntu VPS</li>
            <li>Secure web dashboard (this)</li>
          </ul>
        </Section>

        <Section title="Idea board">
          <p>
            Coming next: simple columns (Ideas / Doing / Done) with cards, stored in SQLite.
          </p>
        </Section>

        <Section title="Security">
          <ul className="list-disc pl-5">
            <li>Will be protected by a single strong password (HTTP Basic Auth)</li>
            <li>Exposed via Cloudflare Tunnel (no open inbound port required)</li>
          </ul>
          <p className="mt-3">
            <Link className="underline" href="/health">Health</Link>
          </p>
        </Section>
      </div>
    </main>
  );
}
