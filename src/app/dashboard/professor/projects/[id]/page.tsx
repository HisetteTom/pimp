import { db } from '@/db';
import { project, team, user, task, livrable, projectEnrollment } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, inArray, or, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProjectStatusSelector } from './project-status-selector';
import { EditProjectDialog } from './edit-project-dialog';
import { DeleteTeamButton } from './delete-team-button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, AlertCircle, ChevronRight, User, Crown } from 'lucide-react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Project Groups - Professor Workspace',
  description: 'View and manage enrolled student teams and their project spaces.',
};

async function fetchSidebarProjects(userId: string, role: string) {
  if (role === 'jury') {
    return await db
      .select()
      .from(project)
      .where(sql`${userId} = ANY(${project.juries})`);
  }
  return await db
    .select()
    .from(project)
    .where(or(eq(project.teacherId, userId), sql`${userId} = ANY(${project.coTeachers})`));
}

export default async function ProfessorProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [t, { id }, session] = await Promise.all([
    getTranslations('ProfessorProjectDetail'),
    params,
    headers().then((h) => auth.api.getSession({ headers: h })),
  ]);
  const projectId = parseInt(id);

  if (isNaN(projectId)) {
    notFound();
  }

  if (
    !session ||
    (session.user.role !== 'professor' &&
      session.user.role !== 'owner' &&
      session.user.role !== 'jury')
  ) {
    redirect('/login');
  }

  // Fetch project, all projects for sidebar, teams, enrollments and users
  const [projectData, allProjects, allTeams, allEnrollments, allUsers] = await Promise.all([
    db.query.project.findFirst({
      where: eq(project.id, projectId),
    }),
    fetchSidebarProjects(session.user.id, session.user.role || 'student'),
    db.select().from(team).where(eq(team.projectId, projectId)),
    db.select().from(projectEnrollment).where(eq(projectEnrollment.projectId, projectId)),
    db.select().from(user),
  ]);

  if (!projectData) {
    notFound();
  }

  const isJury = session.user.role === 'jury';
  if (isJury && !projectData.juries.includes(session.user.id)) {
    redirect('/dashboard/professor');
  }

  const teamIds = allTeams.map((t) => t.id);

  // Fetch tasks and deliverables for these specific teams
  const [allTasks, allDeliverables] = await Promise.all([
    teamIds.length > 0
      ? db.select().from(task).where(inArray(task.teamId, teamIds))
      : Promise.resolve([]),
    teamIds.length > 0
      ? db.select().from(livrable).where(inArray(livrable.teamId, teamIds))
      : Promise.resolve([]),
  ]);

  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  // Index members by team ID
  type MemberWithResponsability = typeof user.$inferSelect & {
    responsabilityId: number | null;
  };
  const membersByTeam = new Map<number, MemberWithResponsability[]>();
  for (const e of allEnrollments) {
    if (!e.teamId) continue;
    const u = userMap.get(e.userId);
    if (!u) continue;
    const list = membersByTeam.get(e.teamId) || [];
    list.push({
      ...u,
      responsabilityId: e.responsabilityId,
    });
    membersByTeam.set(e.teamId, list);
  }

  // Group tasks by team ID
  const tasksByTeam = new Map<number, typeof allTasks>();
  for (const t of allTasks) {
    const list = tasksByTeam.get(t.teamId) || [];
    list.push(t);
    tasksByTeam.set(t.teamId, list);
  }

  // Group deliverables by team ID
  const deliverablesByTeam = new Map<number, typeof allDeliverables>();
  for (const d of allDeliverables) {
    const list = deliverablesByTeam.get(d.teamId) || [];
    list.push(d);
    deliverablesByTeam.set(d.teamId, list);
  }

  // Sidebar dynamic navigation list
  const userProjectsData = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <DashboardLayout userProjects={userProjectsData}>
      <div className="space-y-8 pb-12">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard/professor"
            className="hover:text-primary inline-flex items-center gap-1.5 text-xs font-black tracking-wider text-zinc-400 uppercase transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            {t('back')}
          </Link>
        </div>

        {/* Project Header */}
        <div className="border-zinc-150 flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-start lg:justify-between dark:border-zinc-800">
          <div className="max-w-3xl space-y-2.5">
            <h1 className="text-4xl leading-none font-semibold tracking-tighter text-zinc-900 uppercase dark:text-zinc-100">
              {projectData.name}
            </h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {projectData.description || t('noDescription')}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold tracking-widest text-zinc-400 uppercase">
              <span className="flex items-center gap-1.5">
                <Calendar className="text-primary size-4" />
                {t('start')}{' '}
                {projectData.dateStart
                  ? projectData.dateStart.split('-').reverse().join('/')
                  : 'TBD'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="text-primary size-4" />
                {t('end')}{' '}
                {projectData.dateEnd ? projectData.dateEnd.split('-').reverse().join('/') : 'TBD'}
              </span>
            </div>
          </div>
          {session.user.role !== 'jury' && (
            <div className="flex items-end gap-3">
              <EditProjectDialog projectData={projectData} />
              <ProjectStatusSelector projectId={projectId} initialStatus={projectData.status} />
            </div>
          )}
        </div>

        {/* Teams Overview Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
              {t('enrolledTeams', { count: allTeams.length })}
            </h2>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {allTeams.length === 0 ? (
            <div className="space-y-3 rounded-none border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/10">
              <AlertCircle className="mx-auto size-8 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-700 uppercase dark:text-zinc-300">
                {t('noTeamsTitle')}
              </h3>
              <p className="mx-auto max-w-sm text-xs font-bold tracking-wide text-zinc-400 uppercase">
                {t('noTeamsDesc')}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {allTeams.map((teamItem) => {
                const teamMembers = membersByTeam.get(teamItem.id) || [];
                const teamTasks = tasksByTeam.get(teamItem.id) || [];
                const teamLivrables = deliverablesByTeam.get(teamItem.id) || [];

                // Compute task stats
                const doneTasks = teamTasks.filter((task) => task.status === 'done').length;
                const progressPercent =
                  teamTasks.length > 0 ? Math.round((doneTasks / teamTasks.length) * 100) : 0;

                const hasComments = teamItem.feedback && teamItem.feedback.trim().length > 0;

                return (
                  <Card
                    key={teamItem.id}
                    className="group hover:border-primary/50 relative flex h-full flex-col justify-between overflow-hidden rounded-none border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    {/* SVG grid graphic */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.1]">
                      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern
                            id={`grid-${teamItem.id}`}
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M 40 0 L 0 0 0 40"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="0.5"
                            />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#grid-${teamItem.id})`} />
                      </svg>
                    </div>

                    <CardHeader className="relative z-10 space-y-4 p-8 pb-4">
                      <div>
                        <h3 className="text-secondary text-2xl font-semibold tracking-tighter uppercase">
                          {teamItem.name}
                        </h3>
                        <div className="mt-3 flex items-center gap-2">
                          {hasComments && (
                            <Badge className="rounded-none border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                              {t('commentsAdded')}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="rounded-none border-zinc-300 bg-transparent px-2.5 py-1 text-[9px] font-black tracking-wider text-zinc-500 uppercase dark:border-zinc-700"
                          >
                            {t('deliverablesCount', {
                              count: teamLivrables.length,
                              plural: teamLivrables.length !== 1 ? 's' : '',
                            })}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10 flex flex-1 flex-col justify-between gap-y-6 px-8 pt-2 pb-8">
                      {/* Task Stats & Progress */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                            {t('progress')}
                          </span>
                          <span className="text-secondary font-mono text-[10px] font-black">
                            {progressPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className="from-primary/80 to-primary h-full rounded-full bg-linear-to-r shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <p className="text-[9px] font-bold tracking-wide text-zinc-400 uppercase">
                          {t('tasksCompleted', { done: doneTasks, total: teamTasks.length })}
                        </p>
                      </div>

                      {/* Team Members List */}
                      <div className="space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                        <h4 className="font-mono text-[9px] font-semibold tracking-widest text-zinc-400 uppercase">
                          {t('enrolledMembers', { count: teamMembers.length })}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {teamMembers.length === 0 ? (
                            <p className="text-xs font-bold text-zinc-400 uppercase italic">
                              {t('noMembers')}
                            </p>
                          ) : (
                            teamMembers.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center gap-1.5 rounded-none border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-[10px] font-bold text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-900/10 dark:text-zinc-300"
                              >
                                {m.responsabilityId ? (
                                  <Crown className="size-3 text-amber-500" />
                                ) : (
                                  <User className="size-3 text-zinc-400" />
                                )}
                                <span>{m.name || 'Unknown'}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="space-y-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                        <Link
                          href={`/dashboard/professor/projects/${projectId}/teams/${teamItem.id}`}
                        >
                          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 w-full items-center justify-center gap-1 rounded-none text-sm font-black tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                            {t('openGroupSpace')}
                            <ChevronRight className="size-4" />
                          </Button>
                        </Link>
                        {session.user.role === 'owner' && (
                          <DeleteTeamButton teamId={teamItem.id} teamName={teamItem.name} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
