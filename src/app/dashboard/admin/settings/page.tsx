import { db } from '@/db';
import { project } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SettingsView } from '@/components/dashboard/settings-view';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Settings | Admin Dashboard',
  description: 'Configure your language and application preferences.',
};

/**
 * Administrator settings configuration view. Enables switching locales and updating user settings.
 */
export default async function AdminSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const [cookieStore, t, allProjects] = await Promise.all([
    cookies(),
    getTranslations('Settings'),
    db.select().from(project),
  ]);

  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr';

  const userProjectsSidebarData = allProjects.map((p) => ({
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
