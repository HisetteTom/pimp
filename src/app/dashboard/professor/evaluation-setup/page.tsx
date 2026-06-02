import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { db } from '@/db';
import { project, evaluationCriterion } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import Link from 'next/link';
import { CriteriaManager } from './criteria-manager';
import { or, eq, sql } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Evaluation Grid Setup - PIMP',
  description: 'Configure evaluation grids and custom scoring criteria for student projects.',
};

async function fetchSidebarProjects(teacherId: string) {
  return await db
    .select()
    .from(project)
    .where(or(eq(project.teacherId, teacherId), sql`${teacherId} = ANY(${project.coTeachers})`));
}

export default async function EvaluationSetupPage() {
  const [t, session] = await Promise.all([
    getTranslations('ProfessorEvaluationSetup'),
    headers().then((h) => auth.api.getSession({ headers: h })),
  ]);

  if (!session || session.user.role !== 'professor') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 p-8 dark:bg-zinc-950">
        <Card className="bg-card max-w-md rounded-none border-2 border-red-500/20 shadow-xl">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl font-black tracking-tight text-red-500 uppercase">
              {t('accessDeniedTitle')}
            </CardTitle>
            <CardDescription className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
              {t('accessDeniedSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6 text-center">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {t('accessDeniedMessage')}
            </p>
            <Link
              href="/login"
              className="inline-block bg-zinc-900 px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase transition-transform active:scale-95 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {t('backToLogin')}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch all projects and evaluation criteria in parallel
  const [allProjects, allCriteria] = await Promise.all([
    fetchSidebarProjects(session.user.id),
    db.select().from(evaluationCriterion),
  ]);

  // Format projects list for the sidebar layout
  const sidebarProjects = allProjects.map((p) => ({
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

        <CriteriaManager projects={allProjects} initialCriteria={allCriteria} />
      </div>
    </DashboardLayout>
  );
}
