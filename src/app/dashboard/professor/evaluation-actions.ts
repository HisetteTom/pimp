'use server';

import { db } from '@/db';
import { evaluationCriterion, teamEvaluationScore, team, project } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function createCriterion(data: {
  projectId: number;
  name: string;
  description?: string;
  maxPoints?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    const [newCriterion] = await db
      .insert(evaluationCriterion)
      .values({
        projectId: data.projectId,
        name: data.name,
        description: data.description || null,
        maxPoints: data.maxPoints !== undefined ? data.maxPoints : 20,
      })
      .returning();

    revalidatePath('/dashboard/professor/evaluation-setup');
    return newCriterion;
  } catch (error) {
    console.error('Failed to create criterion:', error);
    throw new Error('Failed to create criterion');
  }
}

export async function updateCriterion(data: {
  id: number;
  name: string;
  description?: string;
  maxPoints?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    const [updated] = await db
      .update(evaluationCriterion)
      .set({
        name: data.name,
        description: data.description || null,
        maxPoints: data.maxPoints !== undefined ? data.maxPoints : 20,
      })
      .where(eq(evaluationCriterion.id, data.id))
      .returning();

    revalidatePath('/dashboard/professor/evaluation-setup');
    return updated;
  } catch (error) {
    console.error('Failed to update criterion:', error);
    throw new Error('Failed to update criterion');
  }
}

export async function deleteCriterion(id: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    const [deleted] = await db
      .delete(evaluationCriterion)
      .where(eq(evaluationCriterion.id, id))
      .returning();

    revalidatePath('/dashboard/professor/evaluation-setup');
    return deleted;
  } catch (error) {
    console.error('Failed to delete criterion:', error);
    throw new Error('Failed to delete criterion');
  }
}

export async function saveTeamEvaluation(data: {
  teamId: number;
  projectId: number;
  scores: { criterionId: number; score?: number; comment?: string }[];
  globalGrade: string;
  juryFeedback: string;
  supervisorNotes: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user.role !== 'professor' && session.user.role !== 'jury')) {
    throw new Error('Unauthorized: Professor or Jury role required');
  }

  try {
    // 1. Update Team global grades/comments
    await db
      .update(team)
      .set({
        grade: data.globalGrade,
        feedback: data.juryFeedback,
        notes: data.supervisorNotes,
      })
      .where(eq(team.id, data.teamId));

    // 2. Save individual criterion scores (Upsert style in parallel)
    await Promise.all(
      data.scores.map(async (item) => {
        const existing = await db
          .select()
          .from(teamEvaluationScore)
          .where(
            and(
              eq(teamEvaluationScore.teamId, data.teamId),
              eq(teamEvaluationScore.criterionId, item.criterionId),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(teamEvaluationScore)
            .set({
              score: item.score !== undefined ? item.score : null,
              comment: item.comment || null,
            })
            .where(eq(teamEvaluationScore.id, existing[0].id));
        } else {
          await db.insert(teamEvaluationScore).values({
            teamId: data.teamId,
            criterionId: item.criterionId,
            score: item.score !== undefined ? item.score : null,
            comment: item.comment || null,
          });
        }
      }),
    );

    // 3. Trigger notification for all team members (Grading notifications disabled for now)

    revalidatePath(`/dashboard/professor/projects/${data.projectId}/teams/${data.teamId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to save team evaluation:', error);
    throw new Error('Failed to save team evaluation');
  }
}

export async function updateProjectEvaluationGridVisibility(projectId: number, show: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'professor') {
    throw new Error('Unauthorized: Professor role required');
  }

  try {
    await db.update(project).set({ showEvaluationGrid: show }).where(eq(project.id, projectId));

    revalidatePath('/dashboard/professor/evaluation-setup');
    revalidatePath(`/dashboard/student/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update evaluation grid visibility:', error);
    throw new Error('Failed to update evaluation grid visibility');
  }
}
