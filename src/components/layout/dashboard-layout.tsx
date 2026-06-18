import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { notification } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface DashboardLayoutProps {
  children: ReactNode;
  userProjects?: { id: number; name: string; teamName?: string }[];
  team?: {
    id: number;
    projectId: number;
    name: string;
    members: { id: string; name: string; responsabilityId: number | null }[];
    projectStatus?: string;
  };
}

/**
 * Master server-side layout wrapper for the authenticated dashboard workspace.
 * Feeds user session properties and unread database notifications count into the Sidebar component.
 */
export async function DashboardLayout({ children, team, userProjects }: DashboardLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let unreadCount = 0;
  if (session) {
    const unread = await db
      .select({ id: notification.id })
      .from(notification)
      .where(and(eq(notification.userId, session.user.id), eq(notification.isRead, false)));
    unreadCount = unread.length;
  }

  return (
    <div className="bg-background flex h-screen w-full flex-row overflow-hidden">
      {/* Left Sidebar */}
      <aside className="bg-card hidden w-64 shrink-0 border-r md:block">
        <Sidebar team={team} userProjects={userProjects} unreadCount={unreadCount} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 pb-16">{children}</div>
      </main>
    </div>
  );
}
