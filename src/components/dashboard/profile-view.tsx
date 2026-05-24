'use client';

import { useTransition, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import {
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
  FileText,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { markAsRead, markAllAsRead } from '@/app/dashboard/actions-notification';

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

export function ProfileView({
  user,
  initialNotifications,
  projectName,
  teamName,
}: ProfileViewProps) {
  const { push } = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticNotifications, setOptimisticNotifications] = useOptimistic(
    initialNotifications,
    (state, action: { type: 'mark_read'; id: number } | { type: 'mark_all_read' }) => {
      if (action.type === 'mark_read') {
        return state.map((n) => (n.id === action.id ? { ...n, isRead: true } : n));
      }
      return state.map((n) => ({ ...n, isRead: true }));
    },
  );

  const unreadCount = optimisticNotifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Avoid triggering card click navigation
    }

    startTransition(async () => {
      setOptimisticNotifications({ type: 'mark_read', id });
      try {
        await markAsRead(id);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      setOptimisticNotifications({ type: 'mark_all_read' });
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

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'project_proposed':
        return <FolderPlus className="size-4.5 text-emerald-500" />;
      case 'task_assigned':
        return <CheckSquare className="size-4.5 text-purple-500" />;
      case 'comment_added':
        return <MessageSquare className="size-4.5 text-amber-500" />;
      case 'note_added':
        return <FileText className="size-4.5 text-blue-500" />;
      case 'task_deadline_tomorrow':
        return <Clock className="size-4.5 animate-pulse text-rose-500" />;
      case 'checkpoint_tomorrow':
        return <Calendar className="size-4.5 text-amber-500" />;
      case 'project_end_tomorrow':
        return <AlertTriangle className="size-4.5 animate-pulse text-red-600" />;
      default:
        return <Bell className="size-4.5 text-zinc-500" />;
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      {/* PROFILE SUMMARY - VERY SMALL HEIGHT */}
      <Card className="rounded-none border-zinc-200/80 bg-white/70 shadow-md backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row md:p-6">
          <div className="flex items-center gap-4">
            {/* Simple Avatar Circle - No Gradient, No Online Dot */}
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-100 text-2xl font-black text-zinc-800 uppercase dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-100">
              {user.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl leading-none font-semibold text-zinc-900 uppercase dark:text-zinc-100">
                {user.name}
              </h2>
              <p className="text-xs font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                {user.email}
              </p>
            </div>
          </div>

          {/* Profile Info Details List - horizontal on md screens */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-[9px] leading-none font-black tracking-widest text-zinc-400 uppercase">
                  Role
                </span>
                <span className="text-[12px] text-zinc-800 uppercase dark:text-zinc-200">
                  {user.role || 'student'}
                </span>
              </div>
            </div>

            {projectName && (
              <div className="flex items-center gap-2">
                <Folder className="size-4 shrink-0 text-zinc-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] leading-none font-black tracking-widest text-zinc-400 uppercase">
                    Project
                  </span>
                  <span className="text-[12px] text-zinc-800 dark:text-zinc-200">
                    {projectName}
                  </span>
                </div>
              </div>
            )}

            {teamName && (
              <div className="flex items-center gap-2">
                <Users className="size-4 shrink-0 text-zinc-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] leading-none font-black tracking-widest text-zinc-400 uppercase">
                    Team
                  </span>
                  <span className="text-[12px] text-zinc-800 dark:text-zinc-200">{teamName}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* NOTIFICATION CENTER - BELOW THE PROFILE */}
      <div className="w-full">
        <Card className="flex min-h-[400px] flex-col rounded-none border-zinc-200/80 bg-white/70 shadow-md backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="rounded bg-purple-500/10 p-2 text-purple-600">
                <Bell className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
                  Notification Center
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs font-bold tracking-widest text-zinc-400 uppercase">
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
                className="flex cursor-pointer items-center gap-1.5 rounded-none border-zinc-200 text-[10px] font-black tracking-widest uppercase transition-all hover:bg-zinc-100 active:scale-95 dark:border-zinc-800 dark:hover:bg-zinc-900"
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

          <CardContent className="flex flex-1 flex-col p-0">
            {optimisticNotifications.length === 0 ? (
              <div className="my-auto flex flex-1 flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <BellOff className="size-8 text-zinc-400" />
                </div>
                <h3 className="text-sm font-semibold tracking-wider text-zinc-800 uppercase dark:text-zinc-200">
                  All caught up!
                </h3>
                <p className="mt-1 max-w-[280px] text-xs font-bold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
                  No notifications yet. New updates will appear here.
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] scrollbar-thin divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-900/60">
                {optimisticNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'group relative flex w-full items-start gap-4 px-6 py-4.5 transition-all hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30',
                      !notif.isRead && 'border-l-2 border-l-purple-600 bg-purple-500/[0.02]',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notif)}
                      className="flex w-full cursor-pointer items-start gap-4 border-0 bg-transparent p-0 text-left outline-none"
                    >
                      {/* Notification Type Icon */}
                      <div className="mt-1 flex shrink-0 items-center justify-center rounded bg-zinc-100 p-2 transition-transform duration-200 group-hover:scale-105 dark:bg-zinc-900">
                        {getNotifIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'text-[13px] font-black tracking-tight uppercase',
                              notif.isRead
                                ? 'text-zinc-700 dark:text-zinc-300'
                                : 'text-zinc-900 dark:text-zinc-50',
                            )}
                          >
                            {notif.title}
                          </span>

                          <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold tracking-wider whitespace-nowrap text-zinc-400 uppercase">
                            <Calendar className="size-3" />
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>

                        <p
                          className={cn(
                            'truncate-2-lines mt-1 text-[12px] leading-relaxed font-medium',
                            notif.isRead
                              ? 'text-zinc-500 dark:text-zinc-400'
                              : 'text-zinc-800 dark:text-zinc-200',
                          )}
                        >
                          {notif.message}
                        </p>

                        {notif.link && (
                          <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-black tracking-widest text-purple-600 uppercase hover:underline dark:text-purple-400">
                            View details{' '}
                            <ArrowRight className="size-2 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Action Dot / Action Hover Button */}
                    <div className="z-10 flex shrink-0 items-center justify-center self-center">
                      {!notif.isRead ? (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          title="Mark as read"
                          className="flex size-3 cursor-pointer items-center justify-center rounded-full border border-purple-500 bg-purple-600 p-0 shadow-[0_0_8px_rgba(147,51,234,0.4)] transition-all hover:border-emerald-400 hover:bg-emerald-500"
                        >
                          <span className="sr-only">Mark Read</span>
                        </button>
                      ) : (
                        <div className="flex size-3 items-center justify-center rounded-full border border-transparent bg-zinc-200 p-0 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-800/80">
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
