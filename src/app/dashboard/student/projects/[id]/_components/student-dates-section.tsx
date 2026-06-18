'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

/**
 * Safeguarded wrapper for rendering dates in local formats.
 * Prevents crash when invalid datetime values are supplied.
 */
function formatLocalDate(dateVal: Date | string | number | null | undefined): string {
  if (!dateVal) return 'No Date';
  try {
    return new Date(dateVal).toLocaleDateString();
  } catch {
    return 'No Date';
  }
}

export interface StudentDatesSectionProps {
  checkpoints: {
    id: number;
    title: string;
    description?: string | null;
    dueDate: Date;
    projectId: number;
  }[];
  checkpointNotes: { id: number; checkpointId: number; teamId: number; notes: string | null }[];
}

/**
 * Renders checkpoints and feedback logs left by the project supervisors.
 */
export function StudentDatesSection({ checkpoints, checkpointNotes }: StudentDatesSectionProps) {
  const t = useTranslations('StudentDatesSection');
  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-none border-2 border-zinc-200 bg-white shadow-none dark:border-zinc-800 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.1]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="student-dates-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#student-dates-grid)" />
        </svg>
      </div>

      <CardHeader className="border-zinc-150 relative z-10 border-b px-6 py-4 dark:border-zinc-800">
        <CardTitle className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
          {t('title')}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 flex flex-col gap-y-6 p-6">
        <div className="flex flex-col gap-y-6">
          {checkpoints.length === 0 ? (
            <p className="py-8 text-center text-xs font-bold text-zinc-400 uppercase italic">
              {t('noCheckpoints')}
            </p>
          ) : (
            checkpoints.map((cp) => {
              const note = checkpointNotes.find((n) => n.checkpointId === cp.id);
              return (
                <div
                  key={cp.id}
                  className="hover:border-primary/40 flex flex-col gap-y-4 rounded-none border border-zinc-200 bg-zinc-50/20 p-5 transition-colors dark:border-zinc-800 dark:bg-zinc-900/5"
                >
                  <div className="flex flex-col gap-2 border-b border-zinc-100 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                    <h4 className="text-sm font-semibold text-zinc-800 uppercase dark:text-zinc-200">
                      {cp.title}
                    </h4>
                    <span
                      suppressHydrationWarning
                      className="border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      {formatLocalDate(cp.dueDate)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-y-2">
                    <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                      {t('supervisorNotes')}
                    </span>
                    {note?.notes ? (
                      <div className="border-primary border-l-2 bg-zinc-50/50 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-700 dark:bg-zinc-900/10 dark:text-zinc-300">
                        {note.notes}
                      </div>
                    ) : (
                      <p className="py-2 text-xs font-bold text-zinc-400 uppercase italic">
                        {t('noNotes')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
