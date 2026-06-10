'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  User,
  LogOut,
  Settings,
  LogOut as LeaveIcon,
  FolderRoot,
  Lightbulb,
  ChevronRight,
  Sun,
  Moon,
  Crown,
  Download,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { leaveTeam } from '@/app/dashboard/student/actions';
import { useTransition, useSyncExternalStore, useState, useEffect } from 'react';
import { getUnreadChatCount } from '@/app/dashboard/actions-chat';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

const emptySubscribe = () => () => {};

interface SidebarProps {
  userProjects?: { id: number; name: string; teamName?: string }[];
  team?: {
    id: number;
    projectId: number;
    name: string;
    members: { id: string; name: string; responsabilityId: number | null }[];
    projectStatus?: string;
  };
  unreadCount?: number;
}

export function Sidebar({ team, userProjects, unreadCount = 0 }: SidebarProps) {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const { push } = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data: session } = authClient.useSession();
  const { setTheme, resolvedTheme } = useTheme();

  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    getUnreadChatCount()
      .then(setUnreadChatCount)
      .catch(() => {});

    // Dynamic background polling every 10 seconds
    const interval = setInterval(async () => {
      try {
        const count = await getUnreadChatCount();
        setUnreadChatCount(count);
      } catch {
        // Silently catch polling errors
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const currentTheme = mounted ? resolvedTheme : 'light';

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const role = session?.user ? (session.user as { role?: string }).role : undefined;
  const isProfessor = role === 'professor' || role === 'owner';
  const isJury = role === 'jury';
  const isStaff = isProfessor || isJury;
  const isAdmin = role === 'admin';

  const navItems = isAdmin
    ? [
        { href: '/dashboard/admin', label: t('dashboard'), icon: LayoutDashboard },
        { href: '/dashboard/admin/teachers', label: t('teachers'), icon: User },
      ]
    : isStaff
      ? [
          { href: '/dashboard/professor#top', label: t('dashboard'), icon: LayoutDashboard },
          { href: '/dashboard/professor#projects', label: t('allProjects'), icon: FolderRoot },
          {
            href: '/dashboard/professor/chat',
            label: t('chat'),
            icon: MessageSquare,
            badge: unreadChatCount,
          },
          ...(isProfessor
            ? [
                {
                  href: '/dashboard/professor/evaluation-setup',
                  label: t('evaluationSetup'),
                  icon: CheckSquare,
                },
                {
                  href: '/dashboard/professor/export',
                  label: t('exportGrades'),
                  icon: Download,
                },
              ]
            : []),
        ]
      : [
          { href: '/dashboard/student#top', label: t('dashboard'), icon: LayoutDashboard },
          { href: '/dashboard/student#my-projects', label: t('myProjects'), icon: FolderRoot },
          { href: '/dashboard/student#proposals', label: t('proposals'), icon: Lightbulb },
          {
            href: '/dashboard/student/chat',
            label: t('chat'),
            icon: MessageSquare,
            badge: unreadChatCount,
          },
        ];

  const dashboardLink = isAdmin
    ? '/dashboard/admin'
    : isStaff
      ? '/dashboard/professor'
      : '/dashboard/student';

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          push('/login');
        },
      },
    });
  };

  const handleLeaveTeam = () => {
    if (!team) return;
    if (
      team.projectStatus &&
      team.projectStatus !== 'proposed' &&
      team.projectStatus !== 'validated'
    ) {
      alert('Cannot leave team once project has started.');
      return;
    }
    if (confirm('Are you sure you want to leave this team?')) {
      startTransition(async () => {
        await leaveTeam(team.projectId);
      });
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="flex h-full scrollbar-none flex-col overflow-y-auto p-6"
    >
      <div className="mb-10 flex items-center gap-3 px-2">
        <Link href={dashboardLink} className="transition-all hover:opacity-80 active:scale-95">
          <span className="text-2xl leading-none font-black tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
            PIMP
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5">
        <p className="mb-2 px-3 text-[10px] font-black tracking-widest text-zinc-400 uppercase">
          {t('navigation')}
        </p>

        <SidebarNavigation navItems={navItems} pathname={pathname} />

        {userProjects && userProjects.length > 0 && (
          <SidebarProjectsList
            projects={userProjects}
            pathname={pathname}
            isAdmin={isAdmin}
            isStaff={isStaff}
          />
        )}

        {!isStaff && team && (
          <SidebarTeamSection team={team} isPending={isPending} handleLeaveTeam={handleLeaveTeam} />
        )}
      </nav>

      <SidebarAccountSection
        isAdmin={isAdmin}
        isStaff={isStaff}
        unreadCount={unreadCount}
        currentTheme={currentTheme as 'light' | 'dark'}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
      />
    </div>
  );
}

interface SidebarNavigationProps {
  navItems: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[];
  pathname: string;
}

function SidebarNavigation({ navItems, pathname }: SidebarNavigationProps) {
  return (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <span
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-none border-l-2 px-3 py-3 text-[13px] font-black tracking-tight uppercase transition-all',
              pathname === item.href
                ? 'border-purple-600 bg-purple-500/10 text-purple-600 shadow-[inset_4px_0px_12px_rgba(168,85,247,0.05)]'
                : 'border-transparent text-zinc-700 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:text-zinc-300 dark:hover:bg-white dark:hover:text-zinc-900',
            )}
          >
            <item.icon
              className={cn(
                'size-4',
                pathname === item.href
                  ? 'text-purple-600'
                  : 'group-hover:text-white dark:group-hover:text-zinc-900',
              )}
            />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white ring-1 ring-white dark:ring-zinc-950">
                {item.badge}
              </span>
            )}
          </span>
        </Link>
      ))}
    </>
  );
}

interface SidebarProjectsListProps {
  projects: { id: number; name: string; teamName?: string }[];
  pathname: string;
  isAdmin: boolean;
  isStaff: boolean;
}

function SidebarProjectsList({ projects, pathname, isAdmin, isStaff }: SidebarProjectsListProps) {
  const t = useTranslations('Sidebar');
  return (
    <div className="space-y-4 pt-8">
      <p className="px-3 text-[10px] font-black tracking-widest text-zinc-400 uppercase">
        {isAdmin || isStaff ? t('allProjects') : t('activeProjects')}
      </p>
      <div className="space-y-1">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={
              isAdmin
                ? `/dashboard/admin/projects/${p.id}`
                : isStaff
                  ? `/dashboard/professor/projects/${p.id}`
                  : `/dashboard/student/projects/${p.id}`
            }
          >
            <div
              className={cn(
                'group flex flex-col border-l-2 px-3 py-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900',
                pathname.includes(`/projects/${p.id}`)
                  ? 'border-purple-600 bg-purple-500/5'
                  : 'border-transparent',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="truncate text-[11px] font-black text-zinc-700 uppercase dark:text-zinc-300">
                  {p.name}
                </span>
                <ChevronRight className="size-3 text-zinc-300 transition-colors group-hover:text-orange-500" />
              </div>
              {p.teamName && (
                <span className="text-[9px] font-bold text-zinc-400 uppercase italic">
                  {t('team')}: {p.teamName}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface SidebarTeamSectionProps {
  team: {
    id: number;
    projectId: number;
    name: string;
    members: { id: string; name: string; responsabilityId: number | null }[];
    projectStatus?: string;
  };
  isPending: boolean;
  handleLeaveTeam: () => void;
}

function SidebarTeamSection({ team, isPending, handleLeaveTeam }: SidebarTeamSectionProps) {
  const t = useTranslations('Sidebar');
  return (
    <div className="space-y-4 pt-8">
      <div className="space-y-1 px-3">
        <p className="text-[13px] font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
          {t('team')}: {team.name}
        </p>
      </div>

      <div className="space-y-1">
        <p className="mb-2 px-3 text-[9px] font-bold tracking-tighter text-zinc-400 uppercase">
          {t('members')}
        </p>
        {team.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-zinc-600 dark:text-zinc-400"
          >
            <div className="relative">
              <div className="flex size-6 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-[10px] font-black dark:border-zinc-700 dark:bg-zinc-800">
                {member.name.charAt(0)}
              </div>
              {member.responsabilityId === 1 && (
                <div className="absolute -top-1 -right-1 rounded-full border border-white bg-amber-500 p-0.5 shadow-sm dark:border-zinc-950">
                  <Crown className="size-2 text-white" />
                </div>
              )}
            </div>
            <span
              className={cn(
                'truncate',
                member.responsabilityId === 1 && 'font-black text-zinc-900 dark:text-zinc-100',
              )}
            >
              {member.name}
            </span>
          </div>
        ))}
      </div>

      {(!team.projectStatus ||
        team.projectStatus === 'proposed' ||
        team.projectStatus === 'validated') && (
        <div className="px-3 pt-2">
          <button
            type="button"
            onClick={handleLeaveTeam}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-200 py-2 text-[10px] font-black tracking-widest text-red-500 uppercase transition-all hover:bg-red-500 hover:text-white active:scale-[0.98] dark:border-red-900/50"
          >
            <LeaveIcon className="size-3" />
            {t('leaveTeam')}
          </button>
        </div>
      )}
    </div>
  );
}

interface SidebarAccountSectionProps {
  isAdmin: boolean;
  isStaff: boolean;
  unreadCount: number;
  currentTheme: 'light' | 'dark';
  toggleTheme: () => void;
  handleLogout: () => void;
}

function SidebarAccountSection({
  isAdmin,
  isStaff,
  unreadCount,
  currentTheme,
  toggleTheme,
  handleLogout,
}: SidebarAccountSectionProps) {
  const t = useTranslations('Sidebar');
  return (
    <div className="mt-auto space-y-2 border-t border-zinc-100 pt-6 dark:border-zinc-800">
      <p className="mb-2 px-3 text-[10px] font-black tracking-widest text-zinc-400 uppercase">
        {t('account')}
      </p>
      <Link
        href={
          isAdmin
            ? '/dashboard/admin/profile'
            : isStaff
              ? '/dashboard/professor/profile'
              : '/dashboard/student/profile'
        }
      >
        <span className="flex items-center justify-between rounded-none border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-zinc-700 transition-all hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:text-zinc-300 dark:hover:bg-white dark:hover:text-zinc-900">
          <div className="flex items-center gap-3">
            <div className="relative">
              <User className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-[14px] animate-pulse items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] leading-none font-black text-white ring-1 ring-white dark:ring-zinc-900">
                  {unreadCount}
                </span>
              )}
            </div>
            <span>{t('profile')}</span>
          </div>
        </span>
      </Link>
      <Link
        href={
          isAdmin
            ? '/dashboard/admin/settings'
            : isStaff
              ? '/dashboard/professor/settings'
              : '/dashboard/student/settings'
        }
      >
        <span className="flex items-center gap-3 rounded-none border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-zinc-700 transition-all hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:text-zinc-300 dark:hover:bg-white dark:hover:text-zinc-900">
          <Settings className="size-4" />
          {t('settings')}
        </span>
      </Link>
      <button
        type="button"
        onClick={toggleTheme}
        suppressHydrationWarning
        className="flex w-full cursor-pointer items-center justify-between rounded-none border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-zinc-700 transition-all hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:text-zinc-300 dark:hover:bg-white dark:hover:text-zinc-900"
      >
        <div className="flex items-center gap-3">
          {currentTheme === 'dark' ? (
            <Sun className="size-4 text-amber-500" />
          ) : (
            <Moon className="size-4 text-indigo-500" />
          )}
          <span>{currentTheme === 'dark' ? t('lightMode') : t('darkMode')}</span>
        </div>
        <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
          {currentTheme === 'dark' ? 'LIGHT' : 'DARK'}
        </span>
      </button>
      <Button
        variant="unstyled"
        onClick={handleLogout}
        className="mt-4 flex w-full items-center justify-start gap-3 rounded-none border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-red-500 transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
      >
        <LogOut className="size-4" />
        {t('logout')}
      </Button>
    </div>
  );
}
