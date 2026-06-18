'use server';

import { db } from '@/db';
import { user, account, team, projectEnrollment } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * Registers a new professor in the system with credentials, forcing a password reset on first access.
 */
export async function createTeacher(formData: { name: string; email: string; password: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const { name, email, password } = formData;

  const userId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name,
      email,
      role: 'professor',
      emailVerified: true,
      requiresPasswordChange: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await tx.insert(account).values({
      id: crypto.randomUUID(),
      userId,
      accountId: userId,
      providerId: 'credential',
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  revalidatePath('/dashboard/admin/teachers');
}

/**
 * Creates a new team under a specified project.
 */
export async function createTeam(projectId: number, name: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await db.insert(team).values({
    name,
    projectId,
  });

  revalidatePath(`/dashboard/admin/projects/${projectId}`);
}

/**
 * Registers a student enrollment for a specific project.
 */
export async function enrollStudent(projectId: number, userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await db
    .insert(projectEnrollment)
    .values({
      projectId,
      userId,
    })
    .onConflictDoNothing();

  revalidatePath(`/dashboard/admin/projects/${projectId}`);
}

/**
 * Cancels a student's project enrollment.
 */
export async function unenrollStudent(projectId: number, userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await db
    .delete(projectEnrollment)
    .where(and(eq(projectEnrollment.projectId, projectId), eq(projectEnrollment.userId, userId)));

  revalidatePath(`/dashboard/admin/projects/${projectId}`);
}

/**
 * Assigns or updates a student's team membership inside a project.
 */
export async function assignStudentToTeam(
  projectId: number,
  userId: string,
  teamId: number | null,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await db
    .update(projectEnrollment)
    .set({ teamId, responsabilityId: null })
    .where(and(eq(projectEnrollment.projectId, projectId), eq(projectEnrollment.userId, userId)));

  revalidatePath(`/dashboard/admin/projects/${projectId}`);
}

import { session as sessionTable, notification as notificationTable, project } from '@/db/schema';
import { sql } from 'drizzle-orm';

/**
 * Deletes a professor profile and removes references in projects, sessions, accounts, and notifications.
 */
export async function deleteTeacher(teacherId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await db.transaction(async (tx) => {
    // Set teacherId to null in project table
    await tx.update(project).set({ teacherId: null }).where(eq(project.teacherId, teacherId));

    // Remove from coTeachers array in project table
    await tx.execute(
      sql`UPDATE "project" SET "co_teachers" = array_remove("co_teachers", ${teacherId}) WHERE ${teacherId} = ANY("co_teachers")`,
    );

    // Delete session, account, notification, and user records
    await tx.delete(sessionTable).where(eq(sessionTable.userId, teacherId));
    await tx.delete(account).where(eq(account.userId, teacherId));
    await tx.delete(notificationTable).where(eq(notificationTable.userId, teacherId));
    await tx.delete(projectEnrollment).where(eq(projectEnrollment.userId, teacherId));
    await tx.delete(user).where(eq(user.id, teacherId));
  });

  revalidatePath('/dashboard/admin/teachers');
}
