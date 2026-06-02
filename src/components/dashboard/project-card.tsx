'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Info, ArrowRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { refuseInvitation, joinProject } from '@/app/dashboard/student/actions';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

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
  membersList?: { id: string; name: string; image?: string | null }[];
  isMember?: boolean;
}

const EMPTY_MEMBERS: { id: string; name: string; image?: string | null }[] = [];

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
  isMember = false,
}: ProjectCardProps) {
  const t = useTranslations('ProjectCard');
  const isAssigned = status.toLowerCase() === 'assigned' || isMember;
  const [isPending, startTransition] = useTransition();

  const progress = (() => {
    if (!dateStart || !dateEnd) return 0;
    const start = new Date(dateStart).getTime();
    const end = new Date(dateEnd).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
  })();

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
    <Card className="group hover:border-primary/50 relative flex h-full flex-col overflow-hidden border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.1]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${id})`} />
        </svg>
      </div>

      <CardHeader className="relative z-10 space-y-4 p-8 pb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle
              className={cn(
                'line-clamp-2 text-2xl font-black tracking-tighter transition-colors duration-300',
                isAssigned ? 'text-secondary' : 'text-primary',
              )}
            >
              {title}
            </CardTitle>
            <div
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-[11px] font-black',
                isAssigned
                  ? 'bg-secondary/5 border-secondary/20 text-secondary'
                  : 'bg-primary/5 border-primary/20 text-primary',
              )}
            >
              <Users className="size-3.5" />
              {groups}/{maxGroups}
            </div>
          </div>
          <CardDescription className="line-clamp-2 text-sm leading-relaxed font-medium text-zinc-500">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 px-8 pb-8">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[9px] font-black tracking-[0.2em] text-zinc-400 uppercase">
            {t('timeline')}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-[9px] font-bold text-zinc-400 uppercase">{t('start')}</p>
              <p className="font-mono text-sm font-black tracking-tight text-zinc-800 dark:text-zinc-200">
                {dateStart || t('tbd')}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-center justify-center pt-4">
              <ArrowRight
                className={cn('size-4 opacity-50', isAssigned ? 'text-secondary' : 'text-primary')}
              />
            </div>

            <div className="flex-1 space-y-1 text-right">
              <p className="text-[9px] font-bold text-zinc-400 uppercase">{t('final')}</p>
              <p className="font-mono text-sm font-black tracking-tight text-zinc-800 dark:text-zinc-200">
                {dateEnd || deadline}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                {t('progress')}
              </span>
              <span
                className={cn(
                  'font-mono text-[10px] font-black',
                  isAssigned ? 'text-secondary' : 'text-primary',
                )}
              >
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000 ease-out',
                  isAssigned
                    ? 'from-secondary/80 to-secondary bg-linear-to-r shadow-[0_0_12px_rgba(var(--secondary-rgb),0.3)]'
                    : 'from-primary/80 to-primary bg-linear-to-r shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]',
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative z-10 mt-auto flex flex-col items-center gap-3 p-8 pt-0">
        {isMember ? (
          <Button
            asChild
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 w-[95%] text-sm font-black tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--secondary-rgb),0.2)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Link
              href={`/dashboard/student/projects/${id}`}
              className="flex items-center justify-center gap-2"
            >
              {t('openProject')}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-primary h-12 w-[95%] border-2 text-sm font-black tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  {t('projectDetails')}
                </Button>
              </DialogTrigger>
              <DialogContent className="overflow-hidden rounded-none border-0 p-0 shadow-2xl sm:max-w-[550px]">
                <div className="space-y-8 bg-white p-10 dark:bg-zinc-950">
                  <DialogHeader className="space-y-3">
                    <DialogTitle className="text-3xl font-black tracking-tighter text-zinc-900 uppercase dark:text-zinc-100">
                      {title}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="border border-zinc-100 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                    <div className="space-y-2 bg-white p-6 dark:bg-zinc-950">
                      <p className="font-mono text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                        {t('finalDeadline')}
                      </p>
                      <p className="text-sm font-bold">{deadline}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="flex items-center gap-3 font-mono text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                      <Info className="size-3" />
                      {t('specifications')}
                    </h4>
                    <p className="text-sm leading-relaxed font-medium text-zinc-500">
                      {fullDescription || description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="flex items-center gap-3 font-mono text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                        <Users className="size-3" />
                        {t('projectGroups')}
                      </h4>
                      <span className="text-primary bg-primary/5 border-primary/10 border px-2 py-0.5 font-mono text-[10px] font-black">
                        {groups} / {maxGroups} {t('groupsSuffix')}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold tracking-tighter text-zinc-400 uppercase">
                      {t('maxMembers')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {membersList.length > 0 ? (
                        membersList.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900"
                          >
                            <div className="flex size-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">
                              {member.name.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                              {member.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-medium text-zinc-400 italic">{t('noMembers')}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <div className="flex items-center justify-between gap-6">
                      <DialogClose asChild>
                        <Button
                          variant="ghost"
                          className="text-xs font-black tracking-wider text-zinc-400 uppercase transition-colors hover:text-zinc-900"
                        >
                          {t('close')}
                        </Button>
                      </DialogClose>
                      {!isMember && (
                        <Button
                          onClick={handleJoin}
                          disabled={isPending}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 flex-1 text-sm font-black tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                          {isPending ? t('loading') : t('joinProject')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {status.toLowerCase() === 'proposed' && (
              <Button
                variant="outline"
                onClick={handleRefuse}
                disabled={isPending}
                className="flex h-12 w-[95%] items-center justify-center gap-2 border-2 border-red-500/10 text-sm font-black tracking-wider text-red-500 uppercase shadow-[4px_4px_0px_0px_rgba(239,68,68,0.1)] transition-all hover:border-red-500/30 hover:bg-red-500/5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <X className="size-4" />
                {isPending ? t('refusing') : t('refuseProposition')}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
