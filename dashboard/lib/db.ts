import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.DASH_DATA_DIR || "/root/clawd/dashboard/data";
const DB_PATH = process.env.DASH_DB_PATH || path.join(DATA_DIR, "dashboard.sqlite");

let db: Database.Database | null = null;

export type Project = {
  id: number;
  slug: string;
  name: string;
  description: string;
  url: string;
  healthUrl: string;
  createdAt: string;
};

export type Task = {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  createdAt: string;
};

export type Idea = {
  id: number;
  projectId: number;
  column: "ideas" | "doing" | "done";
  text: string;
  createdAt: string;
};

function getDb() {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  return db;
}

export function migrateAndSeed() {
  const d = getDb();

  d.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      url TEXT NOT NULL,
      healthUrl TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      column TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      kind TEXT NOT NULL,
      message TEXT NOT NULL
    );
  `);

  const existing = d.prepare("SELECT COUNT(*) as n FROM projects").get() as { n: number };
  if (existing.n > 0) return;

  const now = new Date().toISOString();

  const projectUrl = process.env.DASH_PUBLIC_URL || "https://dash.araneo.org";
  const healthUrl = `${projectUrl.replace(/\/$/, "")}/health`;

  const insertProject = d.prepare(
    "INSERT INTO projects (slug, name, description, url, healthUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const info = insertProject.run(
    "alfred-dashboard",
    "Alfred Dashboard",
    "Secure read-only dashboard for tasks, projects, and idea board.",
    projectUrl,
    healthUrl,
    now
  );
  const projectId = Number(info.lastInsertRowid);

  const insertTask = d.prepare(
    "INSERT INTO tasks (projectId, title, description, status, createdAt) VALUES (?, ?, ?, ?, ?)"
  );
  insertTask.run(projectId, "Set up Next.js dashboard (scaffold)", "", "done", now);
  insertTask.run(projectId, "Protect dashboard with password (basic auth)", "", "done", now);
  insertTask.run(projectId, "Expose via Cloudflare named tunnel on dash.araneo.org", "", "done", now);
  insertTask.run(projectId, "Add SQLite-backed projects/tasks/ideas", "", "doing", now);

  const insertIdea = d.prepare(
    "INSERT INTO ideas (projectId, column, text, createdAt) VALUES (?, ?, ?, ?)"
  );
  insertIdea.run(projectId, "ideas", "Add read-only kanban view for ideas.", now);
  insertIdea.run(projectId, "ideas", "Add activity log page.", now);
  insertIdea.run(projectId, "ideas", "Add buttons for safe Alfred actions later (optional).", now);

  const insertEvent = d.prepare("INSERT INTO events (ts, kind, message) VALUES (?, ?, ?)");
  insertEvent.run(now, "seed", "Initialized database with Alfred Dashboard project.");
}

export function listProjects(): Project[] {
  const d = getDb();
  return d
    .prepare(
      "SELECT id, slug, name, description, url, healthUrl, createdAt FROM projects ORDER BY createdAt DESC"
    )
    .all() as Project[];
}

export function getProjectBySlug(slug: string): Project | null {
  const d = getDb();
  return (
    d
      .prepare(
        "SELECT id, slug, name, description, url, healthUrl, createdAt FROM projects WHERE slug = ?"
      )
      .get(slug) as Project | undefined
  ) ?? null;
}

export function listTasks(projectId: number): Task[] {
  const d = getDb();
  return d
    .prepare(
      "SELECT id, projectId, title, description, status, createdAt FROM tasks WHERE projectId = ? ORDER BY id DESC"
    )
    .all(projectId) as Task[];
}

export function getTask(projectId: number, id: number): Task | null {
  const d = getDb();
  return (
    d
      .prepare(
        "SELECT id, projectId, title, description, status, createdAt FROM tasks WHERE projectId = ? AND id = ?"
      )
      .get(projectId, id) as Task | undefined
  ) ?? null;
}

export function createTask(projectId: number, title: string, description: string) {
  const d = getDb();
  const now = new Date().toISOString();
  const info = d
    .prepare(
      "INSERT INTO tasks (projectId, title, description, status, createdAt) VALUES (?, ?, ?, 'todo', ?)"
    )
    .run(projectId, title.trim(), description.trim(), now);

  d.prepare("INSERT INTO events (ts, kind, message) VALUES (?, ?, ?)").run(
    now,
    "task",
    `Created task: ${title.trim()}`
  );

  return Number(info.lastInsertRowid);
}

export function updateTaskDetails(projectId: number, id: number, title: string, description: string) {
  const d = getDb();
  const now = new Date().toISOString();
  d.prepare("UPDATE tasks SET title = ?, description = ? WHERE projectId = ? AND id = ?").run(
    title.trim(),
    description.trim(),
    projectId,
    id
  );

  d.prepare("INSERT INTO events (ts, kind, message) VALUES (?, ?, ?)").run(
    now,
    "task",
    `Updated task: ${title.trim()}`
  );
}


export function listIdeas(projectId: number): Idea[] {
  const d = getDb();
  return d
    .prepare(
      "SELECT id, projectId, column, text, createdAt FROM ideas WHERE projectId = ? ORDER BY id DESC"
    )
    .all(projectId) as Idea[];
}

export function listEvents(limit = 50): { id: number; ts: string; kind: string; message: string }[] {
  const d = getDb();
  return d
    .prepare("SELECT id, ts, kind, message FROM events ORDER BY id DESC LIMIT ?")
    .all(limit) as any;
}
