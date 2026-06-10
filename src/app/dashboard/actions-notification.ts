'use server';

import { db } from '@/db';
import { notification, project, projectEnrollment, checkpoint, task, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, desc, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function getNotifications() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (session.user.role === 'owner') {
    return [];
  }

  const userId = session.user.id;

  try {
    // 1. Fetch user notifications first
    const userNotifications = await db
      .select()
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt));

    // Helper to check if a date is tomorrow
    const isTomorrow = (d: Date | string | null | undefined): boolean => {
      if (!d) return false;
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return false;

      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      return (
        dateObj.getFullYear() === tomorrow.getFullYear() &&
        dateObj.getMonth() === tomorrow.getMonth() &&
        dateObj.getDate() === tomorrow.getDate()
      );
    };

    // 2. Perform tomorrow check for active project enrollments
    const enrollments = await db
      .select()
      .from(projectEnrollment)
      .where(eq(projectEnrollment.userId, userId));

    if (enrollments.length === 0) {
      return userNotifications;
    }

    // Use Promise.all to run all enrollment checks concurrently
    const results = await Promise.all(
      enrollments.map(async (enrollment) => {
        let createdForEnrollment = false;

        // A. End of project tomorrow
        const [projectData] = await db
          .select()
          .from(project)
          .where(eq(project.id, enrollment.projectId))
          .limit(1);

        if (projectData && isTomorrow(projectData.dateEnd)) {
          const alreadyNotified = userNotifications.some(
            (n) => n.type === 'project_end_tomorrow' && n.message.includes(projectData.name),
          );
          if (!alreadyNotified) {
            await db.insert(notification).values({
              userId,
              title: 'Project Ending Tomorrow',
              message: `Your project "${projectData.name}" is scheduled to end tomorrow. Make sure all deliverables are submitted.`,
              type: 'project_end_tomorrow',
              link: `/dashboard/student/projects/${projectData.id}?tab=overview`,
            });
            createdForEnrollment = true;
          }
        }

        // B. Checkpoint tomorrow
        const checkpoints = await db
          .select()
          .from(checkpoint)
          .where(eq(checkpoint.projectId, enrollment.projectId));

        const checkpointResults = await Promise.all(
          checkpoints.map(async (cp) => {
            if (isTomorrow(cp.dueDate)) {
              const alreadyNotified = userNotifications.some(
                (n) => n.type === 'checkpoint_tomorrow' && n.message.includes(cp.title),
              );
              if (!alreadyNotified) {
                await db.insert(notification).values({
                  userId,
                  title: 'Checkpoint Tomorrow',
                  message: `The checkpoint "${cp.title}" for your project is scheduled for tomorrow.`,
                  type: 'checkpoint_tomorrow',
                  link: `/dashboard/student/projects/${enrollment.projectId}?tab=dates`,
                });
                return true;
              }
            }
            return false;
          }),
        );
        if (checkpointResults.some(Boolean)) {
          createdForEnrollment = true;
        }

        // C. Task deadline tomorrow
        if (enrollment.teamId) {
          const teamTasks = await db
            .select()
            .from(task)
            .where(and(eq(task.teamId, enrollment.teamId), ne(task.status, 'done')));

          const taskResults = await Promise.all(
            teamTasks.map(async (t) => {
              const assigneeSet = t.assignees
                ? new Set(t.assignees.split(',').map((id) => id.trim()))
                : null;
              const isUserTask =
                t.assigneeId === userId || (assigneeSet && assigneeSet.has(userId));

              if (isUserTask && isTomorrow(t.deadline)) {
                const alreadyNotified = userNotifications.some(
                  (n) => n.type === 'task_deadline_tomorrow' && n.message.includes(t.name),
                );
                if (!alreadyNotified) {
                  await db.insert(notification).values({
                    userId,
                    title: 'Task Deadline Tomorrow',
                    message: `Your assigned task "${t.name}" has a deadline tomorrow.`,
                    type: 'task_deadline_tomorrow',
                    link: `/dashboard/student/projects/${enrollment.projectId}?tab=tasks`,
                  });
                  return true;
                }
              }
              return false;
            }),
          );
          if (taskResults.some(Boolean)) {
            createdForEnrollment = true;
          }
        }

        return createdForEnrollment;
      }),
    );

    const notificationsCreated = results.some(Boolean);

    // 3. Re-query user notifications if any were newly created so they are immediately returned
    if (notificationsCreated) {
      return await db
        .select()
        .from(notification)
        .where(eq(notification.userId, userId))
        .orderBy(desc(notification.createdAt));
    }

    return userNotifications;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export async function markAsRead(id: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  try {
    await db
      .update(notification)
      .set({ isRead: true })
      .where(and(eq(notification.id, id), eq(notification.userId, session.user.id)));

    revalidatePath('/dashboard/student/profile');
    revalidatePath('/dashboard/professor/profile');
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw new Error('Failed to update notification');
  }
}

export async function markAllAsRead() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  try {
    await db
      .update(notification)
      .set({ isRead: true })
      .where(eq(notification.userId, session.user.id));

    revalidatePath('/dashboard/student/profile');
    revalidatePath('/dashboard/professor/profile');
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw new Error('Failed to update notifications');
  }
}

// Internal server-side helper to trigger notifications
export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
}: {
  userId: string;
  title: string;
  message: string;
  type:
    | 'project_proposed'
    | 'task_assigned'
    | 'comment_added'
    | 'note_added'
    | 'task_deadline_tomorrow'
    | 'checkpoint_tomorrow'
    | 'project_end_tomorrow'
    | 'deliverable_submitted'
    | 'deliverable_validated';
  link?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  try {
    const [recipient] = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (recipient && recipient.role === 'owner') {
      return; // No notifications at all for owner
    }

    await db.insert(notification).values({
      userId,
      title,
      message,
      type,
      link,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
