import { db } from '@/db';
import { project, team, user, projectEnrollment } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, inArray } from 'drizzle-orm';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SettingsView } from '@/components/dashboard/settings-view';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Settings | Student Dashboard',
  description: 'Configure your language and application preferences.',
};

/**
 * Server page component for student settings.
 * Checks authentication, retrieves active client locales, and constructs
 * navigation parameters to display application preference panels.
 */
export default async function StudentSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  // Fetch locale and student's enrollments concurrently
  const [cookieStore, t, userEnrollments] = await Promise.all([
    cookies(),
    getTranslations('Settings'),
    db.select().from(projectEnrollment).where(eq(projectEnrollment.userId, session.user.id)),
  ]);
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr';

  const activeProjectIds = userEnrollments.map((e) => e.projectId);
  const activeTeamIds = userEnrollments.flatMap((e) => (e.teamId ? [e.teamId] : []));

  const [activeProjects, activeTeams] = await Promise.all([
    activeProjectIds.length > 0
      ? db.select().from(project).where(inArray(project.id, activeProjectIds))
      : Promise.resolve([]),
    activeTeamIds.length > 0
      ? db.select().from(team).where(inArray(team.id, activeTeamIds))
      : Promise.resolve([]),
  ]);

  // Resolve team members of the active team for the sidebar
  const currentTeam = activeTeams[0];
  let sidebarMembers: { id: string; name: string; responsabilityId: number | null }[] = [];

  if (currentTeam) {
    const teamEnrolled = await db
      .select()
      .from(projectEnrollment)
      .where(eq(projectEnrollment.teamId, currentTeam.id));
    const enrolledIds = teamEnrolled.map((e) => e.userId);

    if (enrolledIds.length > 0) {
      const enrolledUsers = await db.select().from(user).where(inArray(user.id, enrolledIds));

      sidebarMembers = enrolledUsers.map((u) => {
        const enroll = teamEnrolled.find((e) => e.userId === u.id);
        return {
          id: u.id,
          name: u.name,
          responsabilityId: enroll?.responsabilityId ?? null,
        };
      });
    }
  }

  const currentProj = currentTeam
    ? activeProjects.find((p) => p.id === currentTeam.projectId)
    : null;
  const sidebarTeamData = currentTeam
    ? {
        id: currentTeam.id,
        projectId: currentTeam.projectId,
        name: currentTeam.name,
        members: sidebarMembers,
        projectStatus: currentProj?.status,
      }
    : undefined;

  const teamMap = new Map(activeTeams.map((t) => [t.id, t]));
  const userProjectsSidebarData = activeProjects.map((p) => {
    const enroll = userEnrollments.find((e) => e.projectId === p.id);
    const tName = enroll?.teamId ? teamMap.get(enroll.teamId) : null;
    return {
      id: p.id,
      name: p.name,
      teamName: tName?.name,
    };
  });

  return (
    <DashboardLayout team={sidebarTeamData} userProjects={userProjectsSidebarData}>
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
