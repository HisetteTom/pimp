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
  evaluationCriterion,
  teamEvaluationScore,
} from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, inArray, or, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SupervisorWorkspace } from './supervisor-workspace';

async function fetchSidebarProjects(teacherId: string) {
  return await db
    .select()
    .from(project)
    .where(or(eq(project.teacherId, teacherId), sql`${teacherId} = ANY(${project.coTeachers})`));
}

export default async function SupervisorTeamPage({
  params,
}: {
  params: Promise<{ id: string; teamId: string }>;
}) {
  const { id, teamId: teamIdStr } = await params;
  const projectId = parseInt(id);
  const teamId = parseInt(teamIdStr);

  if (isNaN(projectId) || isNaN(teamId)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const role = session?.user?.role;
  if (!session || (role !== 'professor' && role !== 'jury')) {
    redirect('/login');
  }

  const [projectData, allProjects, teamData] = await Promise.all([
    db.query.project.findFirst({
      where: eq(project.id, projectId),
    }),
    fetchSidebarProjects(session.user.id),
    db.query.team.findFirst({
      where: and(eq(team.id, teamId), eq(team.projectId, projectId)),
    }),
  ]);

  if (!projectData || !teamData) {
    notFound();
  }

  // Fetch team members, tasks, and deliverables
  const teamEnrollments = await db
    .select()
    .from(projectEnrollment)
    .where(and(eq(projectEnrollment.projectId, projectId), eq(projectEnrollment.teamId, teamId)));

  const teamMemberIds = teamEnrollments.map((e) => e.userId);

  const [
    teamMembers,
    teamTasks,
    teamLivrables,
    checkpoints,
    checkpointNotes,
    criteriaData,
    scoresData,
  ] = await Promise.all([
    teamMemberIds.length > 0
      ? db.query.user.findMany({ where: inArray(user.id, teamMemberIds) })
      : Promise.resolve([]),
    db.query.task.findMany({
      where: eq(task.teamId, teamId),
    }),
    db.query.livrable.findMany({
      where: eq(livrable.teamId, teamId),
    }),
    db.query.checkpoint.findMany({
      where: eq(checkpoint.projectId, projectId),
      orderBy: (checkpoint, { asc }) => [asc(checkpoint.dueDate)],
    }),
    db.query.checkpointNote.findMany({
      where: eq(checkpointNote.teamId, teamId),
    }),
    db.query.evaluationCriterion.findMany({
      where: eq(evaluationCriterion.projectId, projectId),
    }),
    db.query.teamEvaluationScore.findMany({
      where: eq(teamEvaluationScore.teamId, teamId),
    }),
  ]);

  // Sidebar dynamic navigation list
  const userProjectsData = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  const membersWithResponsability = teamMembers.map((m) => {
    const enroll = teamEnrollments.find((e) => e.userId === m.id);
    return {
      ...m,
      responsabilityId: enroll?.responsabilityId ?? null,
    };
  });

  return (
    <DashboardLayout userProjects={userProjectsData}>
      <SupervisorWorkspace
        project={projectData}
        team={teamData}
        members={membersWithResponsability}
        tasks={teamTasks}
        livrables={teamLivrables}
        checkpoints={checkpoints}
        checkpointNotes={checkpointNotes}
        criteria={criteriaData}
        initialScores={scoresData}
        role={role}
      />
    </DashboardLayout>
  );
}
