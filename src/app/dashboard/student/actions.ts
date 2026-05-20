"use server";

import { db } from "@/db";
import { project, user, refusedProject, team, projectEnrollment } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function refuseInvitation(projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Mark as refused for this student
    await db.insert(refusedProject).values({
      userId: session.user.id,
      projectId: projectId,
    }).onConflictDoNothing();

    // 2. Clear enrollment if they were assigned
    await db.delete(projectEnrollment)
      .where(
        and(
          eq(projectEnrollment.userId, session.user.id),
          eq(projectEnrollment.projectId, projectId)
        )
      );

    revalidatePath("/dashboard/student");
  } catch (error) {
    console.error("Failed to refuse invitation:", error);
    throw new Error("Failed to refuse invitation");
  }
}

export async function joinProject(projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Non autorisé");
  }

  // Join project (insert enrollment)
  await db.insert(projectEnrollment).values({
    userId: session.user.id,
    projectId: projectId,
  }).onConflictDoNothing();

  revalidatePath("/dashboard/student");
  redirect(`/dashboard/student/projects/${projectId}`);
}

export async function createTeam(projectId: number, teamName: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  // Check project group limit
  const projectData = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!projectData) throw new Error("Project not found");

  const teamsCount = await db.select({ value: count() }).from(team).where(eq(team.projectId, projectId));
  if (teamsCount[0].value >= projectData.maxGroups) {
    throw new Error("Maximum groups reached for this project");
  }

  // Create team
  const [newTeam] = await db.insert(team).values({
    name: teamName,
    projectId: projectId,
  }).returning();

  // Assign user to team in this project
  await db.update(projectEnrollment)
    .set({ teamId: newTeam.id })
    .where(
      and(
        eq(projectEnrollment.userId, session.user.id),
        eq(projectEnrollment.projectId, projectId)
      )
    );

  revalidatePath(`/dashboard/student/projects/${projectId}`);
}

export async function joinTeam(projectId: number, teamId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  // Check team member limit
  const projectData = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });
  
  if (!projectData) throw new Error("Project not found");

  const membersCount = await db.select({ value: count() }).from(projectEnrollment).where(eq(projectEnrollment.teamId, teamId));
  if (membersCount[0].value >= projectData.maxMembersPerGroup) {
    throw new Error("Team is full");
  }

  // Assign user to team
  await db.update(projectEnrollment)
    .set({ teamId: teamId })
    .where(
      and(
        eq(projectEnrollment.userId, session.user.id),
        eq(projectEnrollment.projectId, projectId)
      )
    );

  revalidatePath(`/dashboard/student/projects/${projectId}`);
}

export async function leaveTeam(projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  await db.update(projectEnrollment)
    .set({ teamId: null })
    .where(
      and(
        eq(projectEnrollment.userId, session.user.id),
        eq(projectEnrollment.projectId, projectId)
      )
    );

  revalidatePath(`/dashboard/student/projects/${projectId}`);
}
