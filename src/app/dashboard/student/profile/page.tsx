import { db } from '@/db';
import { project, team, user, projectEnrollment, notification } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, inArray, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProfileView } from '@/components/dashboard/profile-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Student Dashboard',
  description: 'View your user profile and notifications on PIMP.',
};

export default async function StudentProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  // Fetch student's enrollments to render active project/team and populate layout sidebar
  const userEnrollments = await db
    .select()
    .from(projectEnrollment)
    .where(eq(projectEnrollment.userId, session.user.id));

  const activeProjectIds = userEnrollments.map((e) => e.projectId);
  const activeTeamIds = userEnrollments.flatMap((e) => (e.teamId ? [e.teamId] : []));

  const [activeProjects, activeTeams, userNotifications] = await Promise.all([
    activeProjectIds.length > 0
      ? db.select().from(project).where(inArray(project.id, activeProjectIds))
      : Promise.resolve([]),
    activeTeamIds.length > 0
      ? db.select().from(team).where(inArray(team.id, activeTeamIds))
      : Promise.resolve([]),
    db
      .select()
      .from(notification)
      .where(eq(notification.userId, session.user.id))
      .orderBy(desc(notification.createdAt)),
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

  const sidebarTeamData = currentTeam
    ? {
        id: currentTeam.id,
        projectId: currentTeam.projectId,
        name: currentTeam.name,
        members: sidebarMembers,
      }
    : undefined;

  const teamMap = new Map(activeTeams.map((t) => [t.id, t]));
  const userProjectsSidebarData = activeProjects.map((p) => {
    const enroll = userEnrollments.find((e) => e.projectId === p.id);
    const t = enroll?.teamId ? teamMap.get(enroll.teamId) : null;
    return {
      id: p.id,
      name: p.name,
      teamName: t?.name,
    };
  });

  return (
    <DashboardLayout team={sidebarTeamData} userProjects={userProjectsSidebarData}>
      <div className="space-y-8">
        <div>
          <h1 className="text-secondary text-4xl font-semibold tracking-tighter uppercase">
            User Profile
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium tracking-wide">
            Manage your credentials and keep track of recent updates.
          </p>
        </div>

        <ProfileView
          user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role ?? null,
          }}
          initialNotifications={userNotifications}
        />
      </div>
    </DashboardLayout>
  );
}
