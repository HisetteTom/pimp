import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TeacherChatView } from '@/components/dashboard/teacher-chat-view';
import { db } from '@/db';
import { project } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { or, eq, sql } from 'drizzle-orm';
import { Metadata } from 'next';
import { AccessDenied } from '../_components/access-denied';
import { getSupervisedTeams } from '@/app/dashboard/actions-chat';

export const metadata: Metadata = {
  title: 'Teacher Discussion Board - PIMP',
  description: 'Discuss with your student groups in real-time.',
};

// Static templates moved outside component to prevent rebuild on each render
const sqlStrings = ['', ' = ANY(', ')'];
const templateStrings = Object.assign(sqlStrings, {
  raw: sqlStrings,
}) as unknown as TemplateStringsArray;

/**
 * Workspace enabling real-time communications between professors and student teams.
 */
export default async function ProfessorChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== 'professor' && session.user.role !== 'owner')) {
    return <AccessDenied />;
  }

  // Fetch supervised projects for the sidebar and supervised teams for initial state in parallel
  const [supervisedProjects, supervisedTeams] = await Promise.all([
    db
      .select({ id: project.id, name: project.name })
      .from(project)
      .where(
        or(
          eq(project.teacherId, session.user.id),
          sql(templateStrings, session.user.id, project.coTeachers),
        ),
      ),
    getSupervisedTeams(),
  ]);

  return (
    <DashboardLayout userProjects={supervisedProjects}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
            Discussion Board
          </h1>
          <p className="text-xs font-bold text-zinc-400 uppercase dark:text-zinc-500">
            Communicate with your supervised student groups
          </p>
        </div>

        {/* Server-side loaded teams passed as props to avoid double-render on mount */}
        <TeacherChatView initialTeams={supervisedTeams} />
      </div>
    </DashboardLayout>
  );
}
