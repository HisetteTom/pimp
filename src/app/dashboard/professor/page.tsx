import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CreateProjectDialog } from './create-project-dialog';
import { db } from '@/db';
import { project, user, team, projectEnrollment, livrable, task } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { AccessDenied } from './_components/access-denied';
import { ProfessorMetrics } from './_components/professor-metrics';
import { ProfessorProjectsTable } from './_components/professor-projects-table';
import { or, eq, sql } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Professor Dashboard - PIMP',
  description: 'Monitor student projects, validate deliverables, and grade teams.',
};

async function fetchProfessorProjects(userId: string, role: string) {
  const sqlStrings = ['', ' = ANY(', ')'];
  const templateStrings = Object.assign(sqlStrings, {
    raw: sqlStrings,
  }) as unknown as TemplateStringsArray;

  if (role === 'jury') {
    return await db
      .select()
      .from(project)
      .where(sql(templateStrings, userId, project.juries));
  }

  return await db
    .select()
    .from(project)
    .where(or(eq(project.teacherId, userId), sql(templateStrings, userId, project.coTeachers)));
}

export default async function ProfessorDashboardPage() {
  const [t, session] = await Promise.all([
    getTranslations('ProfessorDashboard'),
    headers().then((h) => auth.api.getSession({ headers: h })),
  ]);

  if (
    !session ||
    (session.user.role !== 'professor' &&
      session.user.role !== 'owner' &&
      session.user.role !== 'jury')
  ) {
    return <AccessDenied />;
  }

  // Fetch all resources in parallel
  const [allProjects, allTeams, allEnrollments, allUsers, allTasks, allDeliverables] =
    await Promise.all([
      fetchProfessorProjects(session.user.id, session.user.role || 'student'),
      db.select().from(team),
      db.select().from(projectEnrollment),
      db.select().from(user),
      db.select().from(task),
      db.select().from(livrable),
    ]);

  const teamsByProject = new Map<number, typeof allTeams>();
  for (const t of allTeams) {
    const list = teamsByProject.get(t.projectId) || [];
    list.push(t);
    teamsByProject.set(t.projectId, list);
  }

  const teamIdsByProject = new Map<number, Set<number>>();
  for (const t of allTeams) {
    const set = teamIdsByProject.get(t.projectId) || new Set();
    set.add(t.id);
    teamIdsByProject.set(t.projectId, set);
  }

  // Calculate metrics
  const totalProjects = allProjects.length;
  const totalTeams = allTeams.length;

  const studentIds = new Set<string>();
  for (const u of allUsers) {
    if (u.role === 'student') {
      studentIds.add(u.id);
    }
  }

  const enrolledStudentIds = new Set<string>();
  for (const e of allEnrollments) {
    if (studentIds.has(e.userId)) {
      enrolledStudentIds.add(e.userId);
    }
  }
  const totalEnrolledStudents = enrolledStudentIds.size;

  const pendingDeliverables = allDeliverables.filter((d) => d.status === 'pending').length;

  // Build projects overview data
  const projectsData = allProjects.map((p) => {
    const projTeams = teamsByProject.get(p.id) || [];
    const projTeamIds = teamIdsByProject.get(p.id) || new Set<number>();

    // Calculate tasks progress for teams under this project
    const projTasks = allTasks.filter((t) => projTeamIds.has(t.teamId));
    const doneTasks = projTasks.filter((t) => t.status === 'done').length;
    const progressPercent =
      projTasks.length > 0 ? Math.round((doneTasks / projTasks.length) * 100) : 0;

    return {
      ...p,
      teamsCount: projTeams.length,
      progress: progressPercent,
      totalTasksCount: projTasks.length,
      doneTasksCount: doneTasks,
    };
  });

  const userProjectsData = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <DashboardLayout userProjects={userProjectsData}>
      <div className="space-y-10 pb-10">
        {/* Header Section */}
        <div
          id="top"
          className="flex scroll-mt-10 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 uppercase dark:text-zinc-100">
              {t('title')}
            </h1>
            <p className="mt-1 text-xs font-bold tracking-widest text-zinc-400 uppercase">
              {t('subtitle')}
            </p>
          </div>
          {session.user.role !== 'jury' && <CreateProjectDialog />}
        </div>

        {/* Metrics Grid */}
        <ProfessorMetrics
          totalProjects={totalProjects}
          totalTeams={totalTeams}
          totalEnrolledStudents={totalEnrolledStudents}
          pendingDeliverables={pendingDeliverables}
        />

        {/* Projects Table Section */}
        <ProfessorProjectsTable projects={projectsData} totalProjects={totalProjects} />
      </div>
    </DashboardLayout>
  );
}
