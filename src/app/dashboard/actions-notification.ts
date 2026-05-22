"use server";

import { db } from "@/db";
import { notification } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getNotifications() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    return await db
      .select()
      .from(notification)
      .where(eq(notification.userId, session.user.id))
      .orderBy(desc(notification.createdAt));
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function markAsRead(id: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(notification)
      .set({ isRead: true })
      .where(
        and(
          eq(notification.id, id),
          eq(notification.userId, session.user.id)
        )
      );

    revalidatePath("/dashboard/student/profile");
    revalidatePath("/dashboard/professor/profile");
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw new Error("Failed to update notification");
  }
}

export async function markAllAsRead() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(notification)
      .set({ isRead: true })
      .where(eq(notification.userId, session.user.id));

    revalidatePath("/dashboard/student/profile");
    revalidatePath("/dashboard/professor/profile");
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    throw new Error("Failed to update notifications");
  }
}

// Internal server-side helper to trigger notifications
export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
}: {
  userId: string;
  title: string;
  message: string;
  type: "project_proposed" | "task_assigned" | "comment_added" | "note_added";
  link?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    await db.insert(notification).values({
      userId,
      title,
      message,
      type,
      link,
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
