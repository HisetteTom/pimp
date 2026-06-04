import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ChatWindow } from '@/components/dashboard/chat-window';
import { getStudentTeamChatInfo } from '@/app/dashboard/actions-chat';
import { db } from '@/db';
import { project, team, projectEnrollment, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Team Chat',
  description: 'Collaborate with your team and supervisors.',
};

export default async function StudentChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-xs font-black text-red-500 uppercase">Unauthorized</span>
      </div>
    );
  }

  // 1. Fetch Student Chat Info & Active Enrollments in parallel
  const [chatInfo, enrollments] = await Promise.all([
    getStudentTeamChatInfo(),
    db.select().from(projectEnrollment).where(eq(projectEnrollment.userId, session.user.id)),
  ]);

  let sidebarTeam = undefined;
  let userProjects: { id: number; name: string; teamName?: string }[] = [];

  if (enrollments.length > 0) {
    const projectIds = enrollments.map((e) => e.projectId);
    const activeProjects = await db
      .select({ id: project.id, name: project.name })
      .from(project)
      .where(and(eq(project.status, 'ongoing'))); // or whatever ongoing filters

    // Filter projects student is actually enrolled in
    const enrolledProjects = activeProjects.filter((p) => projectIds.includes(p.id));

    // Get team details if enrolled
    const activeEnrollmentWithTeam = enrollments.find((e) => e.teamId !== null);
    if (activeEnrollmentWithTeam && activeEnrollmentWithTeam.teamId) {
      const [dbTeam] = await db
        .select()
        .from(team)
        .where(eq(team.id, activeEnrollmentWithTeam.teamId))
        .limit(1);

      if (dbTeam) {
        // Fetch teammates
        const teammates = await db
          .select({
            id: user.id,
            name: user.name,
            responsabilityId: projectEnrollment.responsabilityId,
          })
          .from(projectEnrollment)
          .innerJoin(user, eq(projectEnrollment.userId, user.id))
          .where(eq(projectEnrollment.teamId, dbTeam.id));

        sidebarTeam = {
          id: dbTeam.id,
          projectId: dbTeam.projectId,
          name: dbTeam.name,
          members: teammates.map((m) => ({
            id: m.id,
            name: m.name,
            responsabilityId: m.responsabilityId,
          })),
        };

        userProjects = enrolledProjects.map((p) => ({
          id: p.id,
          name: p.name,
          teamName: dbTeam.name,
        }));
      }
    }
  }

  return (
    <DashboardLayout team={sidebarTeam} userProjects={userProjects}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
            Team Discussion
          </h1>
          <p className="text-xs font-bold text-zinc-400 uppercase dark:text-zinc-500">
            Instant communication with your team and supervisor
          </p>
        </div>

        {!chatInfo ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
            <span className="text-xs font-black tracking-widest text-zinc-400 uppercase">
              No Enrolled Team
            </span>
            <p className="text-xs text-zinc-400">
              You must be registered in a team and project to join the group discussion.
            </p>
          </div>
        ) : (
          <ChatWindow
            key={chatInfo.teamId}
            teamId={chatInfo.teamId}
            teamName={chatInfo.teamName}
            projectName={chatInfo.projectName}
            subtitle={`Supervisor: ${chatInfo.supervisorName}`}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
