import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { notification } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface DashboardLayoutProps {
  children: ReactNode;
  userProjects?: { id: number; name: string; teamName?: string }[];
  team?: { id: number; projectId: number; name: string; members: any[] };
}

export async function DashboardLayout({ children, team, userProjects }: DashboardLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let unreadCount = 0;
  if (session) {
    const unread = await db
      .select({ id: notification.id })
      .from(notification)
      .where(
        and(
          eq(notification.userId, session.user.id),
          eq(notification.isRead, false)
        )
      );
    unreadCount = unread.length;
  }

  return (
    <div className="flex h-screen w-full flex-row bg-background overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:block shrink-0">
        <Sidebar team={team} userProjects={userProjects} unreadCount={unreadCount} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}

