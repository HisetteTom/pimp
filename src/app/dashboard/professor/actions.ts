"use server";

import { db } from "@/db";
import { project, team, livrable, projectEnrollment, checkpoint, checkpointNote } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";


export async function createProject(data: {
  name: string;
  description: string;
  dateStart?: string;
  dateEnd?: string;
  maxGroups: number;
  maxMembersPerGroup: number;
  checkpoints?: { title: string; dueDate: string }[];
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

    if (data.checkpoints && data.checkpoints.length > 0) {
      await db.insert(checkpoint).values(
        data.checkpoints.map((cp) => ({
          projectId: newProject.id,
          title: cp.title,
          dueDate: new Date(cp.dueDate),
        }))
      );
    }

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

export async function createCheckpoint(projectId: number, title: string, dueDate: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "professor") {
    throw new Error("Unauthorized: Professor role required");
  }

  try {
    const [newCheckpoint] = await db.insert(checkpoint).values({
      projectId,
      title,
      dueDate: new Date(dueDate),
    }).returning();

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
    return newCheckpoint;
  } catch (error) {
    console.error("Failed to create checkpoint:", error);
    throw new Error("Failed to create checkpoint");
  }
}

export async function updateCheckpoint(checkpointId: number, title: string, dueDate: string, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "professor") {
    throw new Error("Unauthorized: Professor role required");
  }

  try {
    await db.update(checkpoint)
      .set({
        title,
        dueDate: new Date(dueDate),
      })
      .where(eq(checkpoint.id, checkpointId));

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error("Failed to update checkpoint:", error);
    throw new Error("Failed to update checkpoint");
  }
}

export async function deleteCheckpoint(checkpointId: number, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "professor") {
    throw new Error("Unauthorized: Professor role required");
  }

  try {
    await db.delete(checkpoint)
      .where(eq(checkpoint.id, checkpointId));

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error("Failed to delete checkpoint:", error);
    throw new Error("Failed to delete checkpoint");
  }
}

export async function saveCheckpointNote(checkpointId: number, teamId: number, notes: string, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "professor") {
    throw new Error("Unauthorized: Professor role required");
  }

  try {
    const existing = await db.select()
      .from(checkpointNote)
      .where(
        and(
          eq(checkpointNote.checkpointId, checkpointId),
          eq(checkpointNote.teamId, teamId)
        )
      );

    if (existing.length > 0) {
      await db.update(checkpointNote)
        .set({ notes })
        .where(
          and(
            eq(checkpointNote.checkpointId, checkpointId),
            eq(checkpointNote.teamId, teamId)
          )
        );
    } else {
      await db.insert(checkpointNote).values({
        checkpointId,
        teamId,
        notes,
      });
    }

    revalidatePath(`/dashboard/professor/projects/${projectId}/teams/${teamId}`);
  } catch (error) {
    console.error("Failed to save checkpoint note:", error);
    throw new Error("Failed to save checkpoint note");
  }
}
