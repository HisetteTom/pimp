"use client";

import { useState, useTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Folder,
  Users,
  Bell,
  BellOff,
  Check,
  CheckSquare,
  FolderPlus,
  MessageSquare,
  ArrowRight,
  Loader2,
  Calendar,
  FileText
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { markAsRead, markAllAsRead } from "@/app/dashboard/actions-notification";

interface NotificationItem {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface ProfileViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  };
  initialNotifications: NotificationItem[];
  projectName?: string;
  teamName?: string;
}

export function ProfileView({ user, initialNotifications, projectName, teamName }: ProfileViewProps) {
  const { push } = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticNotifications, setOptimisticNotifications] = useOptimistic(
    initialNotifications,
    (state, action: { type: "mark_read"; id: number } | { type: "mark_all_read" }) => {
      if (action.type === "mark_read") {
        return state.map((n) => (n.id === action.id ? { ...n, isRead: true } : n));
      }
      return state.map((n) => ({ ...n, isRead: true }));
    }
  );

  const unreadCount = optimisticNotifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Avoid triggering card click navigation
    }

    startTransition(async () => {
      setOptimisticNotifications({ type: "mark_read", id });
      try {
        await markAsRead(id);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      setOptimisticNotifications({ type: "mark_all_read" });
      try {
        await markAllAsRead();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.link) {
      push(notif.link);
    }
  };

  // Helper to get relative time
  const formatTime = (dateInput: Date) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "project_proposed":
        return <FolderPlus className="size-4.5 text-emerald-500" />;
      case "task_assigned":
        return <CheckSquare className="size-4.5 text-purple-500" />;
      case "comment_added":
        return <MessageSquare className="size-4.5 text-amber-500" />;
      case "note_added":
        return <FileText className="size-4.5 text-blue-500" />;
      default:
        return <Bell className="size-4.5 text-zinc-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">

      {/* PROFILE SUMMARY - VERY SMALL HEIGHT */}
      <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md shadow-md rounded-none">
        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            {/* Simple Avatar Circle - No Gradient, No Online Dot */}
            <div className="size-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-2xl uppercase text-zinc-800 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
              {user.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold uppercase text-zinc-900 dark:text-zinc-100 leading-none">
                {user.name}
              </h2>
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                {user.email}
              </p>
            </div>
          </div>

          {/* Profile Info Details List - horizontal on md screens */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none">Role</span>
                <span className="text-[12px] uppercase text-zinc-800 dark:text-zinc-200">{user.role || "student"}</span>
              </div>
            </div>

            {projectName && (
              <div className="flex items-center gap-2">
                <Folder className="size-4 text-zinc-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none">Project</span>
                  <span className="text-[12px] text-zinc-800 dark:text-zinc-200">{projectName}</span>
                </div>
              </div>
            )}

            {teamName && (
              <div className="flex items-center gap-2">
                <Users className="size-4 text-zinc-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none">Team</span>
                  <span className="text-[12px] text-zinc-800 dark:text-zinc-200">{teamName}</span>
                </div>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* NOTIFICATION CENTER - BELOW THE PROFILE */}
      <div className="w-full">
        <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md shadow-md rounded-none min-h-[400px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-600 rounded">
                <Bell className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
                  Notification Center
                </CardTitle>
                <CardDescription className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                  Manage your recent platform updates
                </CardDescription>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isPending}
                className="rounded-none border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="size-3 animate-spin text-zinc-500" />
                ) : (
                  <Check className="size-3 text-emerald-500" />
                )}
                Mark All Read
              </Button>
            )}
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col">
            {optimisticNotifications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
                <div className="size-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                  <BellOff className="size-8 text-zinc-400" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  All caught up!
                </h3>
                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1 max-w-[280px]">
                  No notifications yet. New updates will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-900/60 overflow-y-auto max-h-[600px] scrollbar-thin">
                {optimisticNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNotificationClick(notif);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "group flex gap-4 px-6 py-4.5 transition-all cursor-pointer relative items-start hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 outline-none focus-visible:bg-zinc-50/50 dark:focus-visible:bg-zinc-900/30",
                      !notif.isRead && "bg-purple-500/[0.02] border-l-2 border-l-purple-600"
                    )}
                  >
                    {/* Notification Type Icon */}
                    <div className="mt-1 shrink-0 p-2 bg-zinc-100 dark:bg-zinc-900 group-hover:scale-105 transition-transform duration-200 rounded flex items-center justify-center">
                      {getNotifIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "text-[13px] font-black uppercase tracking-tight",
                          notif.isRead ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-900 dark:text-zinc-50"
                        )}>
                          {notif.title}
                        </span>

                        <span className="text-[10px] font-bold text-zinc-400 whitespace-nowrap uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                          <Calendar className="size-3" />
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className={cn(
                        "text-[12px] font-medium leading-relaxed mt-1 truncate-2-lines",
                        notif.isRead ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-800 dark:text-zinc-200"
                      )}>
                        {notif.message}
                      </p>

                      {notif.link && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mt-2 hover:underline">
                          View details <ArrowRight className="size-2 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </div>

                    {/* Action Dot / Action Hover Button */}
                    <div className="shrink-0 flex items-center justify-center self-center">
                      {!notif.isRead ? (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          title="Mark as read"
                          className="size-3 rounded-full bg-purple-600 border border-purple-500 transition-all hover:bg-emerald-500 hover:border-emerald-400 flex items-center justify-center p-0 cursor-pointer shadow-[0_0_8px_rgba(147,51,234,0.4)]"
                        >
                          <span className="sr-only">Mark Read</span>
                        </button>
                      ) : (
                        <div className="size-3 rounded-full bg-zinc-200 dark:bg-zinc-800/80 border border-transparent flex items-center justify-center p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Check className="size-2 text-zinc-400" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
