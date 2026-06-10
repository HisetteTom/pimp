import { db } from '@/db';
import { project, notification } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc, or, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProfileView } from '@/components/dashboard/profile-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Professor Dashboard',
  description: 'View your user profile and notifications on PIMP.',
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

export default async function ProfessorProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    (session.user.role !== 'professor' &&
      session.user.role !== 'owner' &&
      session.user.role !== 'jury')
  ) {
    redirect('/login');
  }

  const isOwner = session.user.role === 'owner';

  // Fetch projects and notifications in parallel
  const isJury = session.user.role === 'jury';
  const [allProjects, userNotifications] = await Promise.all([
    fetchSidebarProjects(session.user.id, session.user.role || 'student'),
    isOwner || isJury
      ? Promise.resolve([])
      : db
          .select()
          .from(notification)
          .where(eq(notification.userId, session.user.id))
          .orderBy(desc(notification.createdAt)),
  ]);

  const userProjectsSidebarData = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <DashboardLayout userProjects={userProjectsSidebarData}>
      <div className="space-y-8">
        <div>
          <h1 className="text-secondary text-4xl font-semibold tracking-tighter uppercase">
            User Profile
          </h1>
        </div>

        <ProfileView
          user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
          }}
          initialNotifications={userNotifications}
        />
      </div>
    </DashboardLayout>
  );
}
