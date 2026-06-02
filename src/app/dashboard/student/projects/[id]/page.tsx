import { db } from '@/db';
import {
  project,
  team,
  user,
  task,
  livrable,
  projectEnrollment,
  checkpoint,
  checkpointNote,
} from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TeamSelection } from './team-selection';
import { ProjectDashboard } from './project-dashboard';

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const { id } = resolvedParams;
  const { tab } = resolvedSearchParams;
  const projectId = parseInt(id);

  if (isNaN(projectId)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const [projectData, allTeams, allEnrollments, userEnrollments] = await Promise.all([
    db.query.project.findFirst({
      where: eq(project.id, projectId),
    }),
    db.select().from(team).where(eq(team.projectId, projectId)),
    db.select().from(projectEnrollment).where(eq(projectEnrollment.projectId, projectId)),
    db.select().from(projectEnrollment).where(eq(projectEnrollment.userId, session.user.id)),
  ]);

  if (!projectData) {
    notFound();
  }

  // Enforce strict student targeting check (manually typed URL protection)
  const userPromo = (session.user as typeof session.user & { promo?: string }).promo || '';
  const targetPromosSet = new Set(projectData.targetPromos || []);
  const targetUsersSet = new Set(projectData.targetUsers || []);
  const isTargeted = targetPromosSet.has(userPromo) || targetUsersSet.has(session.user.id);

  if (!isTargeted) {
    notFound();
  }

  // Fetch users for this project based on enrollments and sidebar data in parallel
  const enrolledUserIds = allEnrollments.map((e) => e.userId);
  const activeProjectIds = userEnrollments.map((e) => e.projectId);
  const activeTeamIds = userEnrollments.flatMap((e) => (e.teamId ? [e.teamId] : []));

  const [projectUsers, activeProjects, activeTeams] = await Promise.all([
    enrolledUserIds.length > 0
      ? db.query.user.findMany({ where: inArray(user.id, enrolledUserIds) })
      : Promise.resolve([]),
    activeProjectIds.length > 0
      ? db.query.project.findMany({ where: inArray(project.id, activeProjectIds) })
      : Promise.resolve([]),
    activeTeamIds.length > 0
      ? db.select().from(team).where(inArray(team.id, activeTeamIds))
      : Promise.resolve([]),
  ]);

  const userMap = new Map(projectUsers.map((u) => [u.id, u]));

  // Index members by team
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

  const teamsWithMembers = allTeams.map((t) => {
    const members = membersByTeam.get(t.id) || [];
    return {
      id: t.id,
      name: t.name,
      projectId: t.projectId,
      grade: t.grade,
      feedback: t.feedback,
      members,
    };
  });

  const currentEnrollment = userEnrollments.find((e) => e.projectId === projectId);
  const userTeam = currentEnrollment?.teamId
    ? teamsWithMembers.find((t) => t.id === currentEnrollment.teamId)
    : null;

  const teamMap = new Map(activeTeams.map((t) => [t.id, t]));

  const userProjectsData = activeProjects.map((p) => {
    const enroll = userEnrollments.find((e) => e.projectId === p.id);
    const t = enroll?.teamId ? teamMap.get(enroll.teamId) : null;
    return {
      id: p.id,
      name: p.name,
      teamName: t?.name,
    };
  });

  const [teamTasks, teamLivrables, checkpoints, checkpointNotes] = userTeam
    ? await Promise.all([
        db.query.task.findMany({
          where: eq(task.teamId, userTeam.id),
        }),
        db.query.livrable.findMany({
          where: eq(livrable.teamId, userTeam.id),
        }),
        db.query.checkpoint.findMany({
          where: eq(checkpoint.projectId, projectId),
          orderBy: (checkpoint, { asc }) => [asc(checkpoint.dueDate)],
        }),
        db.query.checkpointNote.findMany({
          where: eq(checkpointNote.teamId, userTeam.id),
        }),
      ])
    : [[], [], [], []];

  return (
    <DashboardLayout
      userProjects={userProjectsData}
      team={
        userTeam
          ? {
              id: userTeam.id,
              projectId: userTeam.projectId,
              name: userTeam.name,
              members: userTeam.members,
              projectStatus: projectData.status,
            }
          : undefined
      }
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 uppercase dark:text-zinc-100">
            {projectData.name}
          </h1>
        </div>

        {!userTeam ? (
          <TeamSelection
            projectId={projectId}
            teams={teamsWithMembers}
            maxGroups={projectData.maxGroups}
            maxMembers={projectData.maxMembersPerGroup}
            projectStatus={projectData.status}
          />
        ) : (
          <ProjectDashboard
            project={projectData}
            team={userTeam}
            tasks={teamTasks}
            livrables={teamLivrables}
            checkpoints={checkpoints}
            checkpointNotes={checkpointNotes}
            initialTab={tab}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
