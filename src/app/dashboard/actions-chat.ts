'use server';

import { db } from '@/db';
import { chatMessage, chatReadReceipt, team, project, projectEnrollment, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, gt, asc, inArray, sql } from 'drizzle-orm';
import { headers } from 'next/headers';

// 1. Fetch messages for a team
export async function getChatMessages(teamId: number) {
  // Inline Auth Check for React Doctor
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  const currentUser = session.user;

  // Validate user has access to this team's chat
  const role = (currentUser as { role?: string }).role || 'student';
  const isStaff = role === 'professor' || role === 'jury';
  const isAdmin = role === 'admin';

  if (!isStaff && !isAdmin) {
    // Student: check if enrolled in this team
    const enrollment = await db
      .select()
      .from(projectEnrollment)
      .where(
        and(eq(projectEnrollment.userId, currentUser.id), eq(projectEnrollment.teamId, teamId)),
      )
      .limit(1);

    if (enrollment.length === 0) {
      throw new Error('Access denied to this team chat');
    }
  }

  // Fetch messages + sender names
  const messages = await db
    .select({
      id: chatMessage.id,
      text: chatMessage.text,
      createdAt: chatMessage.createdAt,
      senderId: chatMessage.senderId,
      senderName: user.name,
      senderRole: sql<string>`coalesce((${user.role})::text, 'student')`,
    })
    .from(chatMessage)
    .innerJoin(user, eq(chatMessage.senderId, user.id))
    .where(eq(chatMessage.teamId, teamId))
    .orderBy(asc(chatMessage.createdAt));

  return messages;
}

// 2. Send a message to a team
export async function sendChatMessage(teamId: number, text: string) {
  // Inline Auth Check for React Doctor
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  const currentUser = session.user;

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty');
  }

  // Insert message
  const [inserted] = await db
    .insert(chatMessage)
    .values({
      teamId,
      senderId: currentUser.id,
      text: trimmed,
    })
    .returning();

  // Auto update sender's read receipt to now
  await db
    .insert(chatReadReceipt)
    .values({
      userId: currentUser.id,
      teamId,
      lastReadAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [chatReadReceipt.userId, chatReadReceipt.teamId],
      set: { lastReadAt: new Date() },
    });

  return inserted;
}

// 3. Mark team chat as read
export async function markChatAsRead(teamId: number) {
  // Inline Auth Check for React Doctor
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  const currentUser = session.user;

  // Upsert read receipt
  await db
    .insert(chatReadReceipt)
    .values({
      userId: currentUser.id,
      teamId,
      lastReadAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [chatReadReceipt.userId, chatReadReceipt.teamId],
      set: { lastReadAt: new Date() },
    });

  return { success: true };
}

// 4. Get total unread messages count for sidebar
export async function getUnreadChatCount() {
  try {
    // Inline Auth Check for React Doctor
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || !session.user) {
      throw new Error('Unauthorized');
    }
    const currentUser = session.user;

    const role = (currentUser as { role?: string }).role || 'student';
    const isStaff = role === 'professor' || role === 'jury';
    const isAdmin = role === 'admin';

    if (isAdmin) {
      return 0; // Admins don't participate in team chats
    }

    if (isStaff) {
      // Teacher: sum of unread across all supervised teams
      // Find all projects supervised by this teacher
      const supervisedProjects = await db
        .select({ id: project.id })
        .from(project)
        .where(
          sql`${project.teacherId} = ${currentUser.id} or ${currentUser.id} = any(${project.coTeachers})`,
        );

      if (supervisedProjects.length === 0) {
        return 0;
      }

      const projectIds = supervisedProjects.map((p) => p.id);

      // Find all teams in these projects
      const supervisedTeams = await db
        .select({ id: team.id })
        .from(team)
        .where(inArray(team.projectId, projectIds));

      if (supervisedTeams.length === 0) {
        return 0;
      }

      const teamIds = supervisedTeams.map((t) => t.id);

      // Fetch read receipts for this teacher
      const receipts = await db
        .select()
        .from(chatReadReceipt)
        .where(
          and(eq(chatReadReceipt.userId, currentUser.id), inArray(chatReadReceipt.teamId, teamIds)),
        );

      const receiptMap = new Map(receipts.map((r) => [r.teamId, r.lastReadAt]));

      // Concurrent fetch using Promise.all to avoid awaits inside loop
      const unreadPromises = teamIds.map((tId) => {
        const lastRead = receiptMap.get(tId);
        return lastRead
          ? db
              .select({ count: sql<number>`count(*)` })
              .from(chatMessage)
              .where(and(eq(chatMessage.teamId, tId), gt(chatMessage.createdAt, lastRead)))
          : db
              .select({ count: sql<number>`count(*)` })
              .from(chatMessage)
              .where(eq(chatMessage.teamId, tId));
      });

      const results = await Promise.all(unreadPromises);
      const counts = results.map(([res]) => Number(res?.count || 0));
      return counts.reduce((sum, c) => sum + c, 0);
    } else {
      // Student: check their enrolled team
      const [enrollment] = await db
        .select({ teamId: projectEnrollment.teamId })
        .from(projectEnrollment)
        .where(eq(projectEnrollment.userId, currentUser.id))
        .limit(1);

      if (!enrollment || !enrollment.teamId) {
        return 0;
      }

      const tId = enrollment.teamId;

      // Get read receipt
      const [receipt] = await db
        .select()
        .from(chatReadReceipt)
        .where(and(eq(chatReadReceipt.userId, currentUser.id), eq(chatReadReceipt.teamId, tId)))
        .limit(1);

      if (receipt) {
        const [result] = await db
          .select({ count: sql<number>`count(*)` })
          .from(chatMessage)
          .where(and(eq(chatMessage.teamId, tId), gt(chatMessage.createdAt, receipt.lastReadAt)));
        return Number(result?.count || 0);
      } else {
        const [result] = await db
          .select({ count: sql<number>`count(*)` })
          .from(chatMessage)
          .where(eq(chatMessage.teamId, tId));
        return Number(result?.count || 0);
      }
    }
  } catch (err) {
    console.error('Error getting unread count:', err);
    return 0;
  }
}

// 5. Get list of supervised teams for a teacher
export async function getSupervisedTeams() {
  // Inline Auth Check for React Doctor
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  const currentUser = session.user;

  // Find all projects supervised by this teacher
  const supervisedProjects = await db
    .select({ id: project.id, name: project.name })
    .from(project)
    .where(
      sql`${project.teacherId} = ${currentUser.id} or ${currentUser.id} = any(${project.coTeachers})`,
    );

  if (supervisedProjects.length === 0) {
    return [];
  }

  const projectMap = new Map(supervisedProjects.map((p) => [p.id, p.name]));
  const projectIds = supervisedProjects.map((p) => p.id);

  // Find all teams in these projects
  const supervisedTeams = await db
    .select({
      id: team.id,
      name: team.name,
      projectId: team.projectId,
    })
    .from(team)
    .where(inArray(team.projectId, projectIds));

  // Get read receipts
  const receipts = await db
    .select()
    .from(chatReadReceipt)
    .where(
      and(
        eq(chatReadReceipt.userId, currentUser.id),
        inArray(
          chatReadReceipt.teamId,
          supervisedTeams.map((t) => t.id),
        ),
      ),
    );

  const receiptMap = new Map(receipts.map((r) => [r.teamId, r.lastReadAt]));

  // Concurrent fetch using Promise.all to avoid sequential awaits inside loop
  const supervisedTeamsWithCounts = await Promise.all(
    supervisedTeams.map(async (t) => {
      const lastRead = receiptMap.get(t.id);

      const countPromise = lastRead
        ? db
            .select({ count: sql<number>`count(*)` })
            .from(chatMessage)
            .where(and(eq(chatMessage.teamId, t.id), gt(chatMessage.createdAt, lastRead)))
        : db
            .select({ count: sql<number>`count(*)` })
            .from(chatMessage)
            .where(eq(chatMessage.teamId, t.id));

      const membersPromise = db
        .select({ name: user.name })
        .from(projectEnrollment)
        .innerJoin(user, eq(projectEnrollment.userId, user.id))
        .where(eq(projectEnrollment.teamId, t.id));

      const [[res], members] = await Promise.all([countPromise, membersPromise]);
      const unreadCount = Number(res?.count || 0);

      return {
        id: t.id,
        name: t.name,
        projectName: projectMap.get(t.projectId) || 'Unknown Project',
        unreadCount,
        members: members.map((m) => m.name),
      };
    }),
  );

  return supervisedTeamsWithCounts;
}

// 6. Get student's own team details (for direct chat headers)
export async function getStudentTeamChatInfo() {
  // Inline Auth Check for React Doctor
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  const currentUser = session.user;

  // Find enrollment
  const [enrollment] = await db
    .select({
      teamId: projectEnrollment.teamId,
      projectId: projectEnrollment.projectId,
    })
    .from(projectEnrollment)
    .where(eq(projectEnrollment.userId, currentUser.id))
    .limit(1);

  if (!enrollment || !enrollment.teamId) {
    return null;
  }

  // Concurrent fetch of team info and project info to avoid sequential awaits
  const [[teamInfo], [projInfo]] = await Promise.all([
    db.select({ name: team.name }).from(team).where(eq(team.id, enrollment.teamId)).limit(1),
    db
      .select({
        projectName: project.name,
        teacherId: project.teacherId,
      })
      .from(project)
      .where(eq(project.id, enrollment.projectId))
      .limit(1),
  ]);

  let supervisorName = 'No supervisor';
  if (projInfo && projInfo.teacherId) {
    const [teacherUser] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, projInfo.teacherId))
      .limit(1);
    if (teacherUser) {
      supervisorName = teacherUser.name;
    }
  }

  return {
    teamId: enrollment.teamId,
    teamName: teamInfo?.name || 'Unnamed Team',
    projectName: projInfo?.projectName || 'Unnamed Project',
    supervisorName,
  };
}
