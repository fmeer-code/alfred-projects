"use server";

import { redirect } from "next/navigation";
import { ensureSeeded } from "@/lib/seed";
import { getProjectBySlug, createTask } from "@/lib/db";

export async function createTaskAction(slug: string, formData: FormData) {
  ensureSeeded();
  const project = getProjectBySlug(slug);
  if (!project) throw new Error("Project not found");

  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");

  if (!title.trim()) throw new Error("Title is required");

  const id = createTask(project.id, title, description);
  redirect(`/projects/${slug}/tasks/${id}`);
}
