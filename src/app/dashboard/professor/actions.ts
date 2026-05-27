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
} from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createNotification } from '../actions-notification';

export async function getProjectFormDropdowns() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'jury')) {
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

  return { students, professors };
}

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
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
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

      // 1. Fetch students in targeted promos
      if (data.targetPromos && data.targetPromos.length > 0) {
        const promoStudents = await db
          .select({ id: user.id })
          .from(user)
          .where(and(eq(user.role, 'student'), inArray(user.promo, data.targetPromos)));
        for (const s of promoStudents) {
          targetedStudentIds.add(s.id);
        }
      }

      // 2. Add specifically targeted student IDs
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

export async function updateProjectStatus(projectId: number, status: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
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

export async function validateDeliverable(
  deliverableId: number,
  status: string,
  feedback: string,
  projectId: number,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
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

export async function evaluateTeam(
  teamId: number,
  grade: string | null,
  feedback: string,
  projectId: number,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
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

export async function saveTeamNotes(teamId: number, notes: string, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
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

export async function createCheckpoint(projectId: number, title: string, dueDate: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
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

export async function updateCheckpoint(
  checkpointId: number,
  title: string,
  dueDate: string,
  projectId: number,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
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

export async function deleteCheckpoint(checkpointId: number, projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
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

export async function saveCheckpointNote(
  checkpointId: number,
  teamId: number,
  notes: string,
  projectId: number,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
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
  },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
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
      })
      .where(eq(project.id, projectId));

    revalidatePath('/dashboard/professor');
    revalidatePath(`/dashboard/professor/projects/${projectId}`);
  } catch (error) {
    console.error('Failed to update project:', error);
    throw new Error('Failed to update project');
  }
}
