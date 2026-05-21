"use server";

import { db } from "@/db";
import { project, team, livrable, projectEnrollment } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";


export async function createProject(data: {
  name: string;
  description: string;
  dateStart?: string;
  dateEnd?: string;
  maxGroups: number;
  maxMembersPerGroup: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "professor") {
    throw new Error("Unauthorized: Professor role required");
  }

  try {
    const [newProject] = await db.insert(project).values({
      name: data.name,
      description: data.description,
      dateStart: data.dateStart || null,
      dateEnd: data.dateEnd || null,
      maxGroups: data.maxGroups,
      maxMembersPerGroup: data.maxMembersPerGroup,
      status: "proposed",
    }).returning();

    revalidatePath("/dashboard/professor");
    return newProject;
  } catch (error) {
    console.error("Failed to create project:", error);
    throw new Error("Failed to create project");
  }
}

export async function updateProjectStatus(projectId: number, status: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "professor") {
    throw new Error("Unauthorized: Professor role required");
  }

  try {
    await db.update(project)
      .set({ status })
      .where(eq(project.id, projectId));

    revalidatePath("/dashboard/professor");
    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error("Failed to update project status:", error);
    throw new Error("Failed to update project status");
  }
}

export async function validateDeliverable(deliverableId: number, status: string, feedback: string, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "professor") {
    throw new Error("Unauthorized: Professor role required");
  }

  try {
    await db.update(livrable)
      .set({ status, feedback })
      .where(eq(livrable.id, deliverableId));

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error("Failed to validate deliverable:", error);
    throw new Error("Failed to validate deliverable");
  }
}

export async function evaluateTeam(teamId: number, grade: string, feedback: string, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "professor") {
    throw new Error("Unauthorized: Professor role required");
  }

  try {
    await db.update(team)
      .set({ grade, feedback })
      .where(eq(team.id, teamId));

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error("Failed to evaluate team:", error);
    throw new Error("Failed to evaluate team");
  }
}

export async function saveTeamNotes(teamId: number, notes: string, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "professor") {
    throw new Error("Unauthorized: Professor role required");
  }

  try {
    await db.update(team)
      .set({ notes })
      .where(eq(team.id, teamId));

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error("Failed to save team notes:", error);
    throw new Error("Failed to save team notes");
  }
}
