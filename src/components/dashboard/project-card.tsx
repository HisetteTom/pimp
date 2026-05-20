"use client";

import * as React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Info, ArrowRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { refuseInvitation, joinProject } from "@/app/dashboard/student/actions";
import { useTransition } from "react";

interface ProjectCardProps {
  id: number;
  title: string;
  description: string;
  status: string;
  dateStart?: string;
  dateEnd?: string;
  deadline: string;
  groups: number;
  maxGroups: number;
  fullDescription?: string;
  membersList?: { id: string, name: string, image?: string | null }[];
  isMember?: boolean;
}

const EMPTY_MEMBERS: { id: string, name: string, image?: string | null }[] = [];

export function ProjectCard({ 
  id, 
  title, 
  description, 
  status, 
  dateStart, 
  dateEnd, 
  deadline, 
  groups,
  maxGroups,
  fullDescription, 
  membersList = EMPTY_MEMBERS,
  isMember = false
}: ProjectCardProps) {
  const isAssigned = status.toLowerCase() === "assigned" || isMember;
  const [isPending, startTransition] = useTransition();

  const progress = React.useMemo(() => {
    if (!dateStart || !dateEnd) return 0;
    const start = new Date(dateStart).getTime();
    const end = new Date(dateEnd).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
  }, [dateStart, dateEnd]);

  const handleRefuse = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await refuseInvitation(id);
    });
  };

  const handleJoin = () => {
    startTransition(async () => {
      await joinProject(id);
    });
  };

  return (
    <Card className="group relative flex flex-col h-full overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/50">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.1]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${id})`} />
        </svg>
      </div>

      <CardHeader className="p-8 pb-4 space-y-4 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className={cn(
              "text-2xl font-black tracking-tighter transition-colors duration-300 line-clamp-2",
              isAssigned ? "text-secondary" : "text-primary"
            )}>
              {title}
            </CardTitle>
            <div className={cn(
              "shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-[11px] font-black",
              isAssigned 
                ? "bg-secondary/5 border-secondary/20 text-secondary" 
                : "bg-primary/5 border-primary/20 text-primary"
            )}>
              <Users className="size-3.5" />
              {groups}/{maxGroups}
            </div>
          </div>
          <CardDescription className="text-sm font-medium text-zinc-500 line-clamp-2 leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8 relative z-10">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Timeline</span>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-[9px] font-bold text-zinc-400 uppercase">Start</p>
              <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono tracking-tight">{dateStart || "TBD"}</p>
            </div>

            <div className="flex flex-col items-center justify-center shrink-0 pt-4">
              <ArrowRight className={cn(
                "size-4 opacity-50",
                isAssigned ? "text-secondary" : "text-primary"
              )} />
            </div>

            <div className="flex-1 space-y-1 text-right">
              <p className="text-[9px] font-bold text-zinc-400 uppercase">Final</p>
              <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono tracking-tight">{dateEnd || deadline}</p>
            </div>
          </div>

          <div className="space-y-1.5 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Progress</span>
              <span className={cn(
                "font-mono text-[10px] font-black",
                isAssigned ? "text-secondary" : "text-primary"
              )}>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  isAssigned 
                    ? "bg-linear-to-r from-secondary/80 to-secondary shadow-[0_0_12px_rgba(var(--secondary-rgb),0.3)]" 
                    : "bg-linear-to-r from-primary/80 to-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]"
                )} 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto p-8 pt-0 relative z-10 flex flex-col gap-3 items-center">
        {isMember ? (
          <Button asChild className="w-[95%] h-12 text-sm font-black bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all shadow-[4px_4px_0px_0px_rgba(var(--secondary-rgb),0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider">
            <Link href={`/dashboard/student/projects/${id}`} className="flex items-center justify-center gap-2">
              OPEN PROJECT
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-[95%] h-12 text-sm font-black border-2 border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-primary uppercase tracking-wider">
                  PROJECT DETAILS
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl rounded-none">
                <div className="p-10 space-y-8 bg-white dark:bg-zinc-950">
                  <DialogHeader className="space-y-3">
                    <DialogTitle className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">{title}</DialogTitle>
                  </DialogHeader>

                  <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800">
                    <div className="bg-white dark:bg-zinc-950 p-6 space-y-2">
                      <p className="font-mono text-[9px] font-black uppercase text-zinc-400 tracking-widest">Final Deadline</p>
                      <p className="text-sm font-bold">{deadline}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-400 flex items-center gap-3">
                      <Info className="size-3" />
                      Specifications
                    </h4>
                    <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                      {fullDescription || description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-400 flex items-center gap-3">
                        <Users className="size-3" />
                        Project Groups
                      </h4>
                      <span className="font-mono text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 border border-primary/10">
                        {groups} / {maxGroups} GROUPS
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      Max 5 members per group
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {membersList.length > 0 ? (
                        membersList.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg">
                            <div className="size-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                              {member.name.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{member.name}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-medium text-zinc-400 italic">No members yet</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between gap-6">
                      <DialogClose asChild>
                        <Button variant="ghost" className="font-black text-xs uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors">
                          Close
                        </Button>
                      </DialogClose>
                      {!isMember && (
                        <Button 
                          onClick={handleJoin}
                          disabled={isPending}
                          className="flex-1 h-12 text-sm font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider"
                        >
                          {isPending ? "LOADING..." : "JOIN PROJECT"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {status.toLowerCase() === "proposed" && (
              <Button 
                variant="outline" 
                onClick={handleRefuse}
                disabled={isPending}
                className="w-[95%] h-12 text-sm font-black border-2 border-red-500/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all shadow-[4px_4px_0px_0px_rgba(239,68,68,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-red-500 uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <X className="size-4" />
                {isPending ? "REFUSING..." : "REFUSE PROPOSITION"}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
