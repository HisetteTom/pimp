'use server';

import { db } from '@/db';
import { user, account, team, projectEnrollment } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';

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
