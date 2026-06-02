import { db } from '@/db';
import { project } from '@/db/schema';
import { auth } from '@/lib/auth';
import { or, eq, sql } from 'drizzle-orm';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SettingsView } from '@/components/dashboard/settings-view';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Settings | Professor Dashboard',
  description: 'Configure your language and application preferences.',
};

export default async function ProfessorSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'professor') {
    redirect('/login');
  }

  const sqlStrings = ['', ' = ANY(', ')'];
  const templateStrings = Object.assign(sqlStrings, {
    raw: sqlStrings,
  }) as unknown as TemplateStringsArray;

  const [cookieStore, t, profProjects] = await Promise.all([
    cookies(),
    getTranslations('Settings'),
    db
      .select()
      .from(project)
      .where(
        or(
          eq(project.teacherId, session.user.id),
          sql(templateStrings, session.user.id, project.coTeachers),
        ),
      ),
  ]);

  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr';

  const userProjectsSidebarData = profProjects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <DashboardLayout userProjects={userProjectsSidebarData}>
      <div className="space-y-8">
        <div>
          <h1 className="text-secondary text-4xl font-semibold tracking-tighter uppercase">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium tracking-wide">
            {t('subtitle')}
          </p>
        </div>

        <SettingsView initialLocale={locale} />
      </div>
    </DashboardLayout>
  );
}
