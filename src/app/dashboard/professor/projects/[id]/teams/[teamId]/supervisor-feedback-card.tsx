'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { evaluateTeam } from '../../../../actions';
import { Loader2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SupervisorFeedbackCardProps {
  teamId: number;
  projectId: number;
  teamName: string;
  initialFeedback?: string | null;
  type: 'overview' | 'kanban' | 'deliverables';
  readOnly?: boolean;
}

/**
 * Renders a structured feedback panel for a specific dashboard section (overview, kanban, deliverables).
 * Parses section-specific text from a JSON-serialized team feedback field, handles changes locally,
 * and posts update payloads back using the evaluateTeam server action.
 */
export function SupervisorFeedbackCard({
  teamId,
  projectId,
  initialFeedback = '',
  type,
  readOnly = false,
}: SupervisorFeedbackCardProps) {
  const t = useTranslations('ProfessorSupervisorFeedbackCard');
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const typeLabels: Record<string, string> = {
    overview: t('labelOverview'),
    kanban: t('labelKanban'),
    deliverables: t('labelDeliverables'),
  };

  const typeNames: Record<string, string> = {
    overview: t('typeOverview'),
    kanban: t('typeKanban'),
    deliverables: t('typeDeliverables'),
  };

  const parsedFeedbacks = (() => {
    try {
      if (!initialFeedback) return { overview: '', kanban: '', deliverables: '' };
      const parsed = JSON.parse(initialFeedback);
      if (parsed && typeof parsed === 'object') {
        return {
          overview: parsed.overview || '',
          kanban: parsed.kanban || parsed.tasks || '',
          deliverables: parsed.deliverables || '',
        };
      }
    } catch {}
    return { overview: initialFeedback || '', kanban: '', deliverables: '' };
  })();

  const currentInitialText = parsedFeedbacks[type] || '';
  const [feedback, setFeedback] = useState(currentInitialText);

  const handleSave = () => {
    if (readOnly) return;
    startTransition(async () => {
      try {
        const updated = {
          ...parsedFeedbacks,
          [type]: feedback,
        };
        // Passing null for grade since we are completely removing the grading system
        await evaluateTeam(teamId, null, JSON.stringify(updated), projectId);
        toast.success(t('saveSuccess'));
        refresh();
      } catch (err) {
        toast.error(t('saveError'));
        console.error(err);
      }
    });
  };

  const isChanged = feedback !== currentInitialText;

  return (
    <Card className="group hover:border-primary/50 relative w-full overflow-hidden rounded-none border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
      {/* SVG grid graphic */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.1]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={`feedback-grid-${teamId}-${type}`}
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#feedback-grid-${teamId}-${type})`} />
        </svg>
      </div>

      <CardHeader className="relative z-10 border-b border-zinc-100 px-6 py-3.5 dark:border-zinc-800">
        <CardTitle className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
          {t('cardTitle', { type: typeNames[type] })}
        </CardTitle>
      </CardHeader>
      <CardContent className="gap-y-0.01 relative z-10 flex flex-col p-6 pt-4">
        <div className="space-y-0.5">
          <label
            htmlFor={`written-feedback-${type}`}
            className="text-primary text-[10px] font-semibold tracking-widest uppercase"
          >
            {typeLabels[type]}
          </label>
          <Textarea
            id={`written-feedback-${type}`}
            rows={5}
            className="focus-visible:ring-primary resize-y rounded-none border border-zinc-200 bg-zinc-50/50 p-3 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900/10"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isPending || readOnly}
          />
        </div>

        {!readOnly && (
          <Button
            onClick={handleSave}
            disabled={isPending || !isChanged}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-none text-sm font-black tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {t('btnSave', { type: typeNames[type] })}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
