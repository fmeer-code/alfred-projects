"use server";

import { redirect } from "next/navigation";
import { ensureSeeded } from "@/lib/seed";
import { getProjectBySlug, updateTaskDetails, getTask } from "@/lib/db";

export async function updateTaskAction(slug: string, id: number, formData: FormData) {
  ensureSeeded();
  const project = getProjectBySlug(slug);
  if (!project) throw new Error("Project not found");

  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");

  if (!title.trim()) throw new Error("Title is required");

  // Ensure task exists in this project
  const existing = getTask(project.id, id);
  if (!existing) throw new Error("Task not found");

  updateTaskDetails(project.id, id, title, description);
  redirect(`/projects/${slug}/tasks/${id}`);
}
