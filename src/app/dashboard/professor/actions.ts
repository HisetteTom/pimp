'use server';

import { db } from '@/db';
import {
  project,
  team,
  livrable,
  projectEnrollment,
  checkpoint,
  checkpointNote,
  user,
  comment,
  task,
} from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createNotification } from '../actions-notification';

/**
 * Resolves user pools categorized for dropdown selections in project setup.
 */
export async function getProjectFormDropdowns() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (
    !session ||
    (session.user.role !== 'professor' &&
      session.user.role !== 'jury' &&
      session.user.role !== 'owner')
  ) {
    throw new Error('Unauthorized');
  }

  const allUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      promo: user.promo,
    })
    .from(user);

  const students = allUsers.filter((u) => u.role === 'student');
  const professors = allUsers.filter((u) => u.role === 'professor' && u.id !== session.user.id);
  const juries = allUsers.filter((u) => u.role === 'jury');

  return { students, professors, juries };
}

/**
 * Creates a new project workspace and configures initial milestones/checkpoints.
 */
export async function createProject(data: {
  name: string;
  description: string;
  dateStart?: string;
  dateEnd?: string;
  maxGroups: number;
  maxMembersPerGroup: number;
  checkpoints?: { title: string; dueDate: string }[];
  targetPromos?: string[];
  targetUsers?: string[];
  coTeachers?: string[];
  juries?: string[];
  showEvaluationGrid?: boolean;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'owner')) {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    const [newProject] = await db
      .insert(project)
      .values({
        name: data.name,
        description: data.description,
        dateStart: data.dateStart || null,
        dateEnd: data.dateEnd || null,
        maxGroups: data.maxGroups,
        maxMembersPerGroup: data.maxMembersPerGroup,
        status: 'proposed',
        teacherId: session.user.id,
        targetPromos: data.targetPromos || [],
        targetUsers: data.targetUsers || [],
        coTeachers: data.coTeachers || [],
        juries: data.juries || [],
        showEvaluationGrid: data.showEvaluationGrid || false,
      })
      .returning();

    if (data.checkpoints && data.checkpoints.length > 0) {
      await db.insert(checkpoint).values(
        data.checkpoints.map((cp) => ({
          projectId: newProject.id,
          title: cp.title,
          dueDate: new Date(cp.dueDate),
        })),
      );
    }

    // Trigger notification for targeted students only
    try {
      const targetedStudentIds = new Set<string>();

      // Fetch students in targeted promos
      if (data.targetPromos && data.targetPromos.length > 0) {
        const promoStudents = await db
          .select({ id: user.id })
          .from(user)
          .where(and(eq(user.role, 'student'), inArray(user.promo, data.targetPromos)));
        for (const s of promoStudents) {
          targetedStudentIds.add(s.id);
        }
      }

      // Add specifically targeted student IDs
      if (data.targetUsers && data.targetUsers.length > 0) {
        for (const uid of data.targetUsers) {
          targetedStudentIds.add(uid);
        }
      }

      if (targetedStudentIds.size > 0) {
        await Promise.all(
          Array.from(targetedStudentIds).map((uid) =>
            createNotification({
              userId: uid,
              title: 'New Project Proposed',
              message: `A new project "${data.name}" has been proposed to you.`,
              type: 'project_proposed',
              link: `/dashboard/student`,
            }),
          ),
        );
      }
    } catch (notifErr) {
      console.error('Failed to trigger project proposed notifications:', notifErr);
    }

    revalidatePath('/dashboard/professor');
    return newProject;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw new Error('Failed to create project');
  }
}

/**
 * Updates a project's state.
 */
export async function updateProjectStatus(projectId: number, status: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'owner')) {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    await db.update(project).set({ status }).where(eq(project.id, projectId));

    revalidatePath('/dashboard/professor');
    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error('Failed to update project status:', error);
    throw new Error('Failed to update project status');
  }
}

/**
 * Validates team deliverables (approves or rejects) and updates status with feedback.
 */
export async function validateDeliverable(
  deliverableId: number,
  status: string,
  feedback: string,
  projectId: number,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'owner')) {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    const [delivData] = await db
      .update(livrable)
      .set({ status, feedback })
      .where(eq(livrable.id, deliverableId))
      .returning();

    // Trigger notification to students
    if (delivData) {
      try {
        const teamMembers = await db
          .select()
          .from(projectEnrollment)
          .where(eq(projectEnrollment.teamId, delivData.teamId));

        if (teamMembers.length > 0) {
          await Promise.all(
            teamMembers.map((m) =>
              createNotification({
                userId: m.userId,
                title: `Deliverable ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                message: `Your deliverable "${delivData.name}" has been ${status} by the professor.`,
                type: 'deliverable_validated',
                link: `/dashboard/student/projects/${projectId}?tab=deliverables`,
              }),
            ),
          );
        }
      } catch (notifErr) {
        console.error('Failed to trigger deliverable validation notifications:', notifErr);
      }
    }

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
    revalidatePath(`/dashboard/student/projects/${projectId}`);
  } catch (error) {
    console.error('Failed to validate deliverable:', error);
    throw new Error('Failed to validate deliverable');
  }
}

/**
 * Saves team evaluations, recording notes and letter grades.
 */
export async function evaluateTeam(
  teamId: number,
  grade: string | null,
  feedback: string,
  projectId: number,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'owner')) {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    await db.update(team).set({ grade, feedback }).where(eq(team.id, teamId));

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error('Failed to evaluate team:', error);
    throw new Error('Failed to evaluate team');
  }
}

/**
 * Saves confidential notes/observations for a specific team.
 */
export async function saveTeamNotes(teamId: number, notes: string, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'owner')) {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    await db.update(team).set({ notes }).where(eq(team.id, teamId));

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error('Failed to save team notes:', error);
    throw new Error('Failed to save team notes');
  }
}

/**
 * Appends a new checkpoint milestone to a project.
 */
export async function createCheckpoint(projectId: number, title: string, dueDate: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'owner')) {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    const [newCheckpoint] = await db
      .insert(checkpoint)
      .values({
        projectId,
        title,
        dueDate: new Date(dueDate),
      })
      .returning();

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
    return newCheckpoint;
  } catch (error) {
    console.error('Failed to create checkpoint:', error);
    throw new Error('Failed to create checkpoint');
  }
}

/**
 * Updates an existing project checkpoint detail.
 */
export async function updateCheckpoint(
  checkpointId: number,
  title: string,
  dueDate: string,
  projectId: number,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'owner')) {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    await db
      .update(checkpoint)
      .set({
        title,
        dueDate: new Date(dueDate),
      })
      .where(eq(checkpoint.id, checkpointId));

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error('Failed to update checkpoint:', error);
    throw new Error('Failed to update checkpoint');
  }
}

/**
 * Deletes a project checkpoint milestone.
 */
export async function deleteCheckpoint(checkpointId: number, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'owner')) {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    await db.delete(checkpoint).where(eq(checkpoint.id, checkpointId));

    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error('Failed to delete checkpoint:', error);
    throw new Error('Failed to delete checkpoint');
  }
}

/**
 * Saves notes matching a checkpoint status.
 */
export async function saveCheckpointNote(
  checkpointId: number,
  teamId: number,
  notes: string,
  projectId: number,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'owner')) {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    const existing = await db
      .select()
      .from(checkpointNote)
      .where(and(eq(checkpointNote.checkpointId, checkpointId), eq(checkpointNote.teamId, teamId)));

    if (existing.length > 0) {
      await db
        .update(checkpointNote)
        .set({ notes })
        .where(
          and(eq(checkpointNote.checkpointId, checkpointId), eq(checkpointNote.teamId, teamId)),
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
    console.error('Failed to save checkpoint note:', error);
    throw new Error('Failed to save checkpoint note');
  }
}

/**
 * Modifies an existing project definition settings.
 */
export async function updateProject(
  projectId: number,
  data: {
    name: string;
    description: string;
    dateStart?: string;
    dateEnd?: string;
    maxGroups: number;
    maxMembersPerGroup: number;
    targetPromos?: string[];
    targetUsers?: string[];
    coTeachers?: string[];
    juries?: string[];
    showEvaluationGrid?: boolean;
  },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'owner')) {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    await db
      .update(project)
      .set({
        name: data.name,
        description: data.description,
        dateStart: data.dateStart || null,
        dateEnd: data.dateEnd || null,
        maxGroups: data.maxGroups,
        maxMembersPerGroup: data.maxMembersPerGroup,
        targetPromos: data.targetPromos || [],
        targetUsers: data.targetUsers || [],
        coTeachers: data.coTeachers || [],
        juries: data.juries || [],
        showEvaluationGrid: data.showEvaluationGrid ?? false,
      })
      .where(eq(project.id, projectId));

    revalidatePath('/dashboard/professor');
    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error('Failed to update project:', error);
    throw new Error('Failed to update project');
  }
}

/**
 * Deletes a team and cleans up all related comments, tasks, and enrollments in a transaction.
 */
export async function deleteTeam(teamId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'owner' && session.user.role !== 'admin')) {
    throw new Error('Unauthorized: Only owners or admins can delete teams');
  }

  const [teamData] = await db
    .select({ projectId: team.projectId })
    .from(team)
    .where(eq(team.id, teamId))
    .limit(1);

  if (!teamData) {
    throw new Error('Team not found');
  }

  const teamTasks = await db.select({ id: task.id }).from(task).where(eq(task.teamId, teamId));
  const taskIds = teamTasks.map((t) => t.id);

  await db.transaction(async (tx) => {
    if (taskIds.length > 0) {
      // Delete comments referencing these tasks first
      await tx.delete(comment).where(inArray(comment.taskId, taskIds));
    }

    // Run independent tasks, livrables, and enrollment updates in parallel
    const operations: Promise<unknown>[] = [
      tx.delete(livrable).where(eq(livrable.teamId, teamId)),
      tx
        .update(projectEnrollment)
        .set({ teamId: null, responsabilityId: null })
        .where(eq(projectEnrollment.teamId, teamId)),
    ];

    if (taskIds.length > 0) {
      operations.push(tx.delete(task).where(inArray(task.id, taskIds)));
    }

    await Promise.all(operations);

    // Delete team last after removing/updating references
    await tx.delete(team).where(eq(team.id, teamId));
  });

  revalidatePath(`/dashboard/professor/projects/${teamData.projectId}`);
  revalidatePath(`/dashboard/professor`);
}
