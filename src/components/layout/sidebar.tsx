"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderRoot, 
  CheckSquare, 
  MessageSquare, 
  User, 
  LogOut,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const navItems = [
  { href: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/student/projects", label: "Mes Projets", icon: FolderRoot },
  { href: "/dashboard/student/tasks", label: "Tâches", icon: CheckSquare },
  { href: "/dashboard/student/messages", label: "Messages", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { push } = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          push("/login");
        },
      },
    });
  };

  return (
    <div className="flex h-full flex-col p-6 overflow-y-auto scrollbar-none">
      <div className="mb-10 flex items-center gap-3 px-2">
        <Link href="/dashboard/student" className="hover:opacity-80 transition-all active:scale-95">
          <span className="text-2xl font-black tracking-[0.2em] text-secondary leading-none">
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
                "flex items-center gap-3 rounded-none border-l-2 px-3 py-3 text-[13px] font-black uppercase tracking-tight transition-all",
                pathname === item.href 
                  ? "border-primary bg-primary/5 text-primary shadow-[inset_4px_0px_12px_rgba(var(--primary-rgb),0.05)]" 
                  : "border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-900"
              )}
            >
              <item.icon className={cn("size-4", pathname === item.href ? "text-primary" : "text-zinc-400")} />
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-2">
        <p className="px-3 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account</p>
        <Link href="/dashboard/student/profile">
          <span className="flex items-center gap-3 rounded-none border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-zinc-500 transition-all hover:border-secondary hover:bg-secondary/5 hover:text-secondary">
            <User className="size-4 text-zinc-400" />
            Profil
          </span>
        </Link>
        <Link href="/dashboard/student/settings">
          <span className="flex items-center gap-3 rounded-none border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-zinc-500 transition-all hover:border-secondary hover:bg-secondary/5 hover:text-secondary">
            <Settings className="size-4 text-zinc-400" />
            Paramètres
          </span>
        </Link>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start gap-3 rounded-none border-l-2 border-transparent px-3 py-2 text-[12px] font-bold text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 dark:hover:bg-red-950 transition-all mt-4"
        >
          <LogOut className="size-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
