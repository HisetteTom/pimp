'use server';

import { db } from '@/db';
import { project, refusedProject, team, projectEnrollment, task } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createNotification } from '../actions-notification';

export async function refuseInvitation(projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  try {
    // 1. Mark as refused for this student
    await db
      .insert(refusedProject)
      .values({
        userId: session.user.id,
        projectId: projectId,
      })
      .onConflictDoNothing();

    // 2. Clear enrollment if they were assigned
    await db
      .delete(projectEnrollment)
      .where(
        and(
          eq(projectEnrollment.userId, session.user.id),
          eq(projectEnrollment.projectId, projectId),
        ),
      );

    revalidatePath('/dashboard/student');
  } catch (error) {
    console.error('Failed to refuse invitation:', error);
    throw new Error('Failed to refuse invitation');
  }
}

export async function joinProject(projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Non autorisé');
  }

  // Join project (insert enrollment)
  await db
    .insert(projectEnrollment)
    .values({
      userId: session.user.id,
      projectId: projectId,
    })
    .onConflictDoNothing();

  revalidatePath('/dashboard/student');
  redirect(`/dashboard/student/projects/${projectId}`);
}

export async function createTeam(projectId: number, teamName: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  // Check project group limit
  const projectData = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!projectData) throw new Error('Project not found');

  if (projectData.status !== 'proposed' && projectData.status !== 'validated') {
    throw new Error('Team creation is only allowed for proposed or validated projects');
  }

  const teamsCount = await db
    .select({ value: count() })
    .from(team)
    .where(eq(team.projectId, projectId));
  if (teamsCount[0].value >= projectData.maxGroups) {
    throw new Error('Maximum groups reached for this project');
  }

  // Create team
  const [newTeam] = await db
    .insert(team)
    .values({
      name: teamName,
      projectId: projectId,
    })
    .returning();

  // Assign user to team in this project and make them leader
  await db
    .update(projectEnrollment)
    .set({ teamId: newTeam.id, responsabilityId: 1 })
    .where(
      and(
        eq(projectEnrollment.userId, session.user.id),
        eq(projectEnrollment.projectId, projectId),
      ),
    );

  revalidatePath(`/dashboard/student/projects/${projectId}`);
}

export async function joinTeam(projectId: number, teamId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  // Check team member limit
  const projectData = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!projectData) throw new Error('Project not found');

  if (projectData.status !== 'proposed' && projectData.status !== 'validated') {
    throw new Error('Joining a team is only allowed for proposed or validated projects');
  }

  const membersCount = await db
    .select({ value: count() })
    .from(projectEnrollment)
    .where(eq(projectEnrollment.teamId, teamId));
  if (membersCount[0].value >= projectData.maxMembersPerGroup) {
    throw new Error('Team is full');
  }

  // Assign user to team
  await db
    .update(projectEnrollment)
    .set({ teamId: teamId })
    .where(
      and(
        eq(projectEnrollment.userId, session.user.id),
        eq(projectEnrollment.projectId, projectId),
      ),
    );

  revalidatePath(`/dashboard/student/projects/${projectId}`);
}

export async function leaveTeam(projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  const projectData = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!projectData) throw new Error('Project not found');

  if (projectData.status !== 'proposed' && projectData.status !== 'validated') {
    throw new Error('Leaving a team is only allowed for proposed or validated projects');
  }

  await db
    .update(projectEnrollment)
    .set({ teamId: null, responsabilityId: null })
    .where(
      and(
        eq(projectEnrollment.userId, session.user.id),
        eq(projectEnrollment.projectId, projectId),
      ),
    );

  revalidatePath(`/dashboard/student/projects/${projectId}`);
}

export async function createTask(data: {
  name: string;
  description?: string;
  priority: string;
  status?: string;
  deadline?: Date;
  teamId: number;
  assigneeId?: string;
  assignees?: string;
  projectId: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  const now = new Date();
  await db.insert(task).values({
    name: data.name,
    description: data.description,
    priority: data.priority,
    status: data.status || 'todo',
    deadline: data.deadline,
    teamId: data.teamId,
    assigneeId: data.assigneeId,
    assignees: data.assignees,
    inProgressAt: data.status === 'in_progress' || data.status === 'done' ? now : null,
    completedAt: data.status === 'done' ? now : null,
  });

  // Trigger task assigned notifications
  try {
    const assigneeIds = new Set<string>();
    if (data.assignees) {
      data.assignees.split(',').forEach((id) => {
        const trimmed = id.trim();
        if (trimmed) assigneeIds.add(trimmed);
      });
    }
    if (data.assigneeId) {
      assigneeIds.add(data.assigneeId);
    }
    await Promise.all(
      Array.from(assigneeIds).map((assigneeId) =>
        createNotification({
          userId: assigneeId,
          title: 'New Task Assigned',
          message: `You have been assigned to task "${data.name}".`,
          type: 'task_assigned',
          link: `/dashboard/student/projects/${data.projectId}?tab=kanban`,
        }),
      ),
    );
  } catch (notifErr) {
    console.error('Failed to trigger task assignment notifications:', notifErr);
  }

  revalidatePath(`/dashboard/student/projects/${data.projectId}`);
}

export async function updateTaskStatus(taskId: number, status: string, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  const now = new Date();
  const existingTask = await db.query.task.findFirst({
    where: eq(task.id, taskId),
  });

  const updateData: {
    status: string;
    inProgressAt?: Date | null;
    completedAt?: Date | null;
  } = { status };

  if (status === 'todo') {
    updateData.inProgressAt = null;
    updateData.completedAt = null;
  } else if (status === 'in_progress') {
    if (!existingTask?.inProgressAt) {
      updateData.inProgressAt = now;
    }
    updateData.completedAt = null;
  } else if (status === 'done') {
    if (!existingTask?.inProgressAt) {
      updateData.inProgressAt = existingTask?.createdAt || now;
    }
    updateData.completedAt = now;
  }

  await db.update(task).set(updateData).where(eq(task.id, taskId));

  revalidatePath(`/dashboard/student/projects/${projectId}`);
}

export async function deleteTask(taskId: number, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  await db.delete(task).where(eq(task.id, taskId));

  revalidatePath(`/dashboard/student/projects/${projectId}`);
}

export async function updateTask(data: {
  id: number;
  name: string;
  description?: string | null;
  priority: string;
  deadline?: Date | null;
  assigneeId?: string | null;
  assignees?: string | null;
  projectId: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  await db
    .update(task)
    .set({
      name: data.name,
      description: data.description,
      priority: data.priority,
      deadline: data.deadline,
      assigneeId: data.assigneeId,
      assignees: data.assignees,
    })
    .where(eq(task.id, data.id));

  // Trigger task assigned notifications on update
  try {
    const assigneeIds = new Set<string>();
    if (data.assignees) {
      data.assignees.split(',').forEach((id) => {
        const trimmed = id.trim();
        if (trimmed) assigneeIds.add(trimmed);
      });
    }
    if (data.assigneeId) {
      assigneeIds.add(data.assigneeId);
    }
    await Promise.all(
      Array.from(assigneeIds).map((assigneeId) =>
        createNotification({
          userId: assigneeId,
          title: 'Task Assigned / Updated',
          message: `You are assigned to task "${data.name}".`,
          type: 'task_assigned',
          link: `/dashboard/student/projects/${data.projectId}?tab=kanban`,
        }),
      ),
    );
  } catch (notifErr) {
    console.error('Failed to trigger task update notifications:', notifErr);
  }

  revalidatePath(`/dashboard/student/projects/${data.projectId}`);
}
