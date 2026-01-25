import { NextResponse } from "next/server";
import { migrateAndSeed, getProjectBySlug, listProjects } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  migrateAndSeed();
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") || "alfred-dashboard";
  const projects = listProjects();
  const project = getProjectBySlug(slug);
  return NextResponse.json({
    ok: true,
    slug,
    projectsCount: projects.length,
    slugs: projects.map((p) => p.slug),
    found: !!project,
    project,
    env: {
      DASH_DATA_DIR: process.env.DASH_DATA_DIR || null,
      DASH_DB_PATH: process.env.DASH_DB_PATH || null,
      DASH_PUBLIC_URL: process.env.DASH_PUBLIC_URL || null,
    },
  });
}
