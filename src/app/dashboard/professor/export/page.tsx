import { db } from '@/db';
import {
  project,
  team,
  evaluationCriterion,
  teamEvaluationScore,
  projectEnrollment,
  user,
} from '@/db/schema';
import { auth } from '@/lib/auth';
import { or, eq, inArray, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ExportManager } from './export-manager';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Export Evaluations - PIMP',
  description: 'Export student project evaluation details to Excel or print/save as PDF.',
};

async function getProfessorProjects(teacherId: string) {
  return db
    .select()
    .from(project)
    .where(or(eq(project.teacherId, teacherId), sql`${teacherId} = ANY(${project.coTeachers})`));
}

export default async function ExportPage() {
  const [t, session] = await Promise.all([
    getTranslations('ProfessorExport'),
    headers().then((h) => auth.api.getSession({ headers: h })),
  ]);

  if (!session || session.user.role !== 'professor') {
    redirect('/login');
  }

  const teacherId = session.user.id;

  // 1. Fetch all projects where teacher is owner or co-teacher
  const professorProjects = await getProfessorProjects(teacherId);

  const projectIds = professorProjects.map((p) => p.id);

  // 2. Fetch dependencies in parallel
  const [allCriteria, allTeams, allEnrollments] = await Promise.all([
    projectIds.length > 0
      ? db
          .select()
          .from(evaluationCriterion)
          .where(inArray(evaluationCriterion.projectId, projectIds))
      : Promise.resolve([]),
    projectIds.length > 0
      ? db.select().from(team).where(inArray(team.projectId, projectIds))
      : Promise.resolve([]),
    projectIds.length > 0
      ? db.select().from(projectEnrollment).where(inArray(projectEnrollment.projectId, projectIds))
      : Promise.resolve([]),
  ]);

  const teamIds = allTeams.map((t) => t.id);

  const [allTeamScores, allUsers] = await Promise.all([
    teamIds.length > 0
      ? db.select().from(teamEvaluationScore).where(inArray(teamEvaluationScore.teamId, teamIds))
      : Promise.resolve([]),
    allEnrollments.length > 0
      ? db
          .select()
          .from(user)
          .where(
            inArray(
              user.id,
              allEnrollments.map((e) => e.userId),
            ),
          )
      : Promise.resolve([]),
  ]);

  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  // Indexing maps
  const criteriaByProject = new Map<number, typeof allCriteria>();
  for (const c of allCriteria) {
    const list = criteriaByProject.get(c.projectId) || [];
    list.push(c);
    criteriaByProject.set(c.projectId, list);
  }

  const teamsByProject = new Map<number, typeof allTeams>();
  for (const t of allTeams) {
    const list = teamsByProject.get(t.projectId) || [];
    list.push(t);
    teamsByProject.set(t.projectId, list);
  }

  const enrollmentsByTeam = new Map<number, typeof allEnrollments>();
  for (const e of allEnrollments) {
    if (!e.teamId) continue;
    const list = enrollmentsByTeam.get(e.teamId) || [];
    list.push(e);
    enrollmentsByTeam.set(e.teamId, list);
  }

  const scoresByTeam = new Map<number, typeof allTeamScores>();
  for (const s of allTeamScores) {
    const list = scoresByTeam.get(s.teamId) || [];
    list.push(s);
    scoresByTeam.set(s.teamId, list);
  }

  // Build clean, highly-structured project export dataset
  const exportData = professorProjects.map((p) => {
    const projCriteria = criteriaByProject.get(p.id) || [];
    const projTeams = teamsByProject.get(p.id) || [];

    return {
      id: p.id,
      name: p.name,
      showEvaluationGrid: p.showEvaluationGrid,
      criteria: projCriteria.map((c) => ({
        id: c.id,
        name: c.name,
        maxPoints: c.maxPoints,
      })),
      teams: projTeams.map((t) => {
        const teamEnrollments = enrollmentsByTeam.get(t.id) || [];
        const teamScores = scoresByTeam.get(t.id) || [];

        const members = teamEnrollments.flatMap((e) => {
          const u = userMap.get(e.userId);
          if (!u) return [];
          return [
            {
              id: u.id,
              name: u.name || '',
              email: u.email || '',
            },
          ];
        });

        return {
          id: t.id,
          name: t.name,
          grade: t.grade,
          feedback: t.feedback,
          notes: t.notes,
          members,
          scores: teamScores.map((s) => ({
            criterionId: s.criterionId,
            score: s.score,
            comment: s.comment,
          })),
        };
      }),
    };
  });

  const sidebarProjects = professorProjects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <DashboardLayout userProjects={sidebarProjects}>
      <div className="space-y-6">
        <div className="flex flex-col gap-1 border-b border-zinc-100 pb-5 dark:border-zinc-800">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
            {t('title')}
          </h1>
          <p className="text-xs font-medium text-zinc-400">{t('description')}</p>
        </div>

        <ExportManager initialProjects={exportData} />
      </div>
    </DashboardLayout>
  );
}
