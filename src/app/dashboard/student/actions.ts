"use server";

import { db } from "@/db";
import { project, user, refusedProject } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

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

    // 2. Clear projectId if they were assigned
    await db.update(user)
      .set({ projectId: null })
      .where(
        and(
          eq(user.id, session.user.id),
          eq(user.projectId, projectId)
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

  // Join project
  await db.update(user)
    .set({ projectId: projectId })
    .where(eq(user.id, session.user.id));

  revalidatePath("/dashboard/student");
}
