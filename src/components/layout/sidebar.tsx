"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  MessageSquare, 
  User, 
  LogOut,
  Settings,
  LogOut as LeaveIcon,
  Kanban as KanbanIcon,
  FileBox,
  FolderRoot,
  Lightbulb,
  ChevronRight,
  Sun,
  Moon,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { leaveTeam } from "@/app/dashboard/student/actions";
import { useTransition, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const emptySubscribe = () => () => {};

const navItems = [
  { href: "/dashboard/student#top", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/student#my-projects", label: "My Projects", icon: FolderRoot },
  { href: "/dashboard/student#proposals", label: "Proposals", icon: Lightbulb },
];

interface SidebarProps {
  userProjects?: { id: number; name: string; teamName?: string }[];
  team?: { id: number; projectId: number; name: string; members: any[] };
  unreadCount?: number;
}

export function Sidebar({ team, userProjects, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { push } = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data: session } = authClient.useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const currentTheme = mounted ? resolvedTheme : "light";

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const role = (session?.user as any)?.role;
  const isProfessor = role === "professor";
  const isJury = role === "jury";
  const isStaff = isProfessor || isJury;

  const navItems = isStaff ? [
    { href: "/dashboard/professor#top", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/professor#projects", label: "All Projects", icon: FolderRoot },
    ...(isProfessor ? [{ href: "/dashboard/professor/evaluation-setup", label: "Evaluation Setup", icon: CheckSquare }] : []),
  ] : [
    { href: "/dashboard/student#top", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/student#my-projects", label: "My Projects", icon: FolderRoot },
    { href: "/dashboard/student#proposals", label: "Proposals", icon: Lightbulb },
  ];

  const dashboardLink = isStaff ? "/dashboard/professor" : "/dashboard/student";

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          push("/login");
        },
      },
    });
  };

  const handleLeaveTeam = () => {
    if (!team) return;
    if (confirm("Are you sure you want to leave this team?")) {
      startTransition(async () => {
        await leaveTeam(team.projectId);
      });
    }
  };

  return (
    <div suppressHydrationWarning className="flex h-full flex-col p-6 overflow-y-auto scrollbar-none">
      <div className="mb-10 flex items-center gap-3 px-2">
        <Link href={dashboardLink} className="hover:opacity-80 transition-all active:scale-95">
          <span className="text-2xl font-black tracking-[0.2em] text-zinc-900 dark:text-zinc-100 leading-none">
            PIMP
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5">
        <p className="px-3 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Navigation</p>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                "flex items-center gap-3 rounded-none border-l-2 px-3 py-3 text-[13px] font-black uppercase tracking-tight transition-all cursor-pointer",
                pathname === item.href 
                  ? "border-purple-600 bg-purple-500/10 text-purple-600 shadow-[inset_4px_0px_12px_rgba(168,85,247,0.05)]" 
                  : "border-transparent text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900"
              )}
            >
              <item.icon className={cn("size-4", pathname === item.href ? "text-purple-600" : "group-hover:text-white dark:group-hover:text-zinc-900")} />
              {item.label}
            </span>
          </Link>
        ))}

        {userProjects && userProjects.length > 0 && (
          <div className="pt-8 space-y-4">
            <p className="px-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              {isStaff ? "All Projects" : "Active Projects"}
            </p>
            <div className="space-y-1">
              {userProjects.map((p) => (
                <Link key={p.id} href={isStaff ? `/dashboard/professor/projects/${p.id}` : `/dashboard/student/projects/${p.id}`}>
                  <div className={cn(
                    "group flex flex-col px-3 py-2 border-l-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900",
                    pathname.includes(`/projects/${p.id}`) ? "border-purple-600 bg-purple-500/5" : "border-transparent"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase truncate text-zinc-700 dark:text-zinc-300">
                        {p.name}
                      </span>
                      <ChevronRight className="size-3 text-zinc-300 group-hover:text-orange-500 transition-colors" />
                    </div>
                    {p.teamName && (
                      <span className="text-[9px] font-bold text-zinc-400 uppercase italic">
                        Team: {p.teamName}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isStaff && team && (
          <div className="pt-8 space-y-4">
            <div className="px-3 space-y-1">
              <p className="text-[13px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                Team: {team.name}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="px-3 mb-2 text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Members</p>
              {team.members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center gap-3 px-3 py-2 text-[12px] font-bold text-zinc-600 dark:text-zinc-400 border-l-2 border-transparent"
                >
                  <div className="relative">
                    <div className="size-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black border border-zinc-200 dark:border-zinc-700">
                      {member.name.charAt(0)}
                    </div>
                    {member.responsabilityId === 1 && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-white dark:border-zinc-950 shadow-sm">
                        <Crown className="size-2 text-white" />
                      </div>
                    )}
                  </div>
                  <span className={cn("truncate", member.responsabilityId === 1 && "text-zinc-900 dark:text-zinc-100 font-black")}>
                    {member.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-3 pt-2">
              <button 
                type="button"
                onClick={handleLeaveTeam}
                disabled={isPending}
                className="w-full text-[10px] font-black text-red-500 hover:text-white hover:bg-red-500 py-2 border border-red-200 dark:border-red-900/50 rounded uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <LeaveIcon className="size-3" />
                Leave Team
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-2">
        <p className="px-3 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account</p>
        <Link href={isStaff ? "/dashboard/professor/profile" : "/dashboard/student/profile"}>
          <span className="flex items-center justify-between rounded-none border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-zinc-700 dark:text-zinc-300 transition-all hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900">
            <div className="flex items-center gap-3">
              <div className="relative">
                <User className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-black text-white leading-none ring-1 ring-white dark:ring-zinc-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span>Profile</span>
            </div>
          </span>
        </Link>
        <Link href={isStaff ? "/dashboard/professor/settings" : "/dashboard/student/settings"}>
          <span className="flex items-center gap-3 rounded-none border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-zinc-700 dark:text-zinc-300 transition-all hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900">
            <Settings className="size-4" />
            Settings
          </span>
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          suppressHydrationWarning
          className="w-full flex items-center justify-between rounded-none border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-zinc-700 dark:text-zinc-300 transition-all hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {currentTheme === "dark" ? (
              <Sun className="size-4 text-amber-500" />
            ) : (
              <Moon className="size-4 text-indigo-500" />
            )}
            <span>{currentTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500">
            {currentTheme === "dark" ? "LIGHT" : "DARK"}
          </span>
        </button>
        <Button 
          variant="unstyled" 
          onClick={handleLogout}
          className="w-full justify-start gap-3 rounded-none border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 dark:hover:bg-red-950 transition-all mt-4 flex items-center"
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
