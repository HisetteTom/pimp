import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { db } from '@/db';
import { project, user, team, projectEnrollment } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { AccessDenied } from '../../../professor/_components/access-denied';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { EnrollmentTool, CreateTeamTool } from './project-controls';

import { ProjectHeaderCard, EnrolledStudentsTable, TeamsStatusList } from './project-details';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const proj = await db.query.project.findFirst({
    where: eq(project.id, parseInt(id)),
  });
  return {
    title: proj ? `${proj.name} Control Center - PIMP` : 'Project Control Center',
  };
}

/**
 * Administrator project control room view. Resolves project metadata,
 * enrolled students, and group allocations.
 */
export default async function AdminProjectControlPage({ params }: Props) {
  const [t, session] = await Promise.all([
    getTranslations('AdminProjectControl'),
    headers().then((h) => auth.api.getSession({ headers: h })),
  ]);

  if (!session || session.user.role !== 'admin') {
    return <AccessDenied />;
  }

  const { id } = await params;
  const projectId = parseInt(id);

  // Fetch project details
  const currentProject = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });

  if (!currentProject) {
    notFound();
  }

  // Fetch project enrollments, teams, and users
  const [enrollments, teams, allUsers, allProjects] = await Promise.all([
    db.select().from(projectEnrollment).where(eq(projectEnrollment.projectId, projectId)),
    db.select().from(team).where(eq(team.projectId, projectId)),
    db.select().from(user),
    db.select().from(project),
  ]);

  const userProjectsData = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  // Map users into easily accessible structures
  const usersById = new Map<string, (typeof allUsers)[0]>();
  for (const u of allUsers) {
    usersById.set(u.id, u);
  }

  const professorName = currentProject.teacherId
    ? usersById.get(currentProject.teacherId)?.name || t('unknownProfessor')
    : t('noTeacherAssigned');

  // Find enrolled students and teams details
  const enrolledStudentIds = new Set<string>();
  const enrolledStudentsData = enrollments.map((e) => {
    const s = usersById.get(e.userId);
    enrolledStudentIds.add(e.userId);

    const teamItem = teams.find((ti) => ti.id === e.teamId);

    return {
      id: e.userId,
      name: s?.name || t('unknownStudent'),
      username: s?.username || 'unknown',
      email: s?.email || 'n/a',
      promo: s?.promo || t('noPromo'),
      teamId: e.teamId,
      teamName: teamItem?.name || null,
    };
  });

  // Sort enrolled students by name
  enrolledStudentsData.sort((a, b) => a.name.localeCompare(b.name));

  // Find unenrolled students in the system
  const unenrolledStudents = allUsers.reduce<
    {
      id: string;
      name: string;
      username: string | null;
      promo: string | null;
    }[]
  >((acc, u) => {
    if (u.role === 'student' && !enrolledStudentIds.has(u.id)) {
      acc.push({
        id: u.id,
        name: u.name,
        username: u.username,
        promo: u.promo,
      });
    }
    return acc;
  }, []);

  unenrolledStudents.sort((a, b) => a.name.localeCompare(b.name));

  // Count team sizes
  const teamMemberCounts = new Map<number, number>();
  const membersByTeam = new Map<number, typeof enrolledStudentsData>();
  for (const es of enrolledStudentsData) {
    if (es.teamId !== null) {
      teamMemberCounts.set(es.teamId, (teamMemberCounts.get(es.teamId) || 0) + 1);
      const list = membersByTeam.get(es.teamId) || [];
      list.push(es);
      membersByTeam.set(es.teamId, list);
    }
  }

  return (
    <DashboardLayout userProjects={userProjectsData}>
      <div className="space-y-10 pb-10">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-zinc-400 uppercase transition-colors hover:text-purple-600"
          >
            <ArrowLeft className="size-3.5" />
            {t('back')}
          </Link>
        </div>

        {/* Project Header Card */}
        <ProjectHeaderCard currentProject={currentProject} professorName={professorName} />

        {/* Dynamic Enrollment & Team Creation Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <CreateTeamTool projectId={projectId} />
          <EnrollmentTool projectId={projectId} unenrolledStudents={unenrolledStudents} />
        </div>

        {/* Main Grid: Students & Teams */}
        <div className="grid items-start gap-8 lg:grid-cols-3">
          {/* Left: Students Table (2/3) */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
                {t('enrolledStudents')}
              </h2>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <Badge className="rounded-none bg-zinc-900 font-black text-white dark:bg-zinc-100 dark:text-zinc-900">
                {enrolledStudentsData.length}
              </Badge>
            </div>

            <EnrolledStudentsTable
              enrolledStudents={enrolledStudentsData}
              teams={teams}
              projectId={projectId}
            />
          </div>

          {/* Right: Teams List (1/3) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
                {t('teamsStatus')}
              </h2>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <Badge className="rounded-none bg-zinc-900 font-black text-white dark:bg-zinc-100 dark:text-zinc-900">
                {teams.length}
              </Badge>
            </div>

            <TeamsStatusList
              teams={teams}
              maxMembersPerGroup={currentProject.maxMembersPerGroup}
              teamMemberCounts={teamMemberCounts}
              membersByTeam={membersByTeam}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
