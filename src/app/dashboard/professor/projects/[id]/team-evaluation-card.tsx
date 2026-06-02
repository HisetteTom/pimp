'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { evaluateTeam } from '../../actions';
import { Loader2, FileEdit } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TeamEvaluationCardProps {
  teamId: number;
  projectId: number;
  teamName: string;
  initialGrade?: string | null;
  initialFeedback?: string | null;
}

export function TeamEvaluationCard({
  teamId,
  projectId,
  teamName,
  initialGrade = '',
  initialFeedback = '',
}: TeamEvaluationCardProps) {
  const t = useTranslations('ProfessorTeamEvaluationCard');
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const [grade, setGrade] = useState(initialGrade || '');
  const [feedback, setFeedback] = useState(initialFeedback || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (grade && (parseFloat(grade) < 0 || parseFloat(grade) > 20)) {
      toast.error(t('gradeError'));
      return;
    }

    startTransition(async () => {
      try {
        await evaluateTeam(teamId, grade, feedback, projectId);
        toast.success(t('saveSuccess', { name: teamName }));
        refresh();
      } catch (err) {
        toast.error(t('saveError'));
        console.error(err);
      }
    });
  };

  const isEvaluated = initialGrade || initialFeedback;

  return (
    <Card
      className={`rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.03)] transition-all hover:shadow-none ${isEvaluated ? 'border-purple-500/30 bg-purple-500/[0.01]' : 'border-zinc-200 dark:border-zinc-800'}`}
    >
      <CardHeader className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-black tracking-wider text-zinc-800 uppercase dark:text-zinc-200">
            {t('title')}
          </CardTitle>
        </div>
        <CardDescription className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor={`grade-${teamId}`}
              className="text-[10px] font-black tracking-widest text-zinc-500 uppercase"
            >
              {t('gradeLabel')}
            </Label>
            <div className="relative">
              <span className="absolute top-3 left-3.5 text-[13px] font-black text-zinc-400">
                /20
              </span>
              <Input
                id={`grade-${teamId}`}
                type="number"
                step="0.25"
                min="0"
                max="20"
                className="h-11 rounded-none border-2 border-zinc-200 pl-12 font-bold transition-colors hover:border-zinc-300 focus-visible:ring-purple-500 dark:border-zinc-800 dark:hover:border-zinc-700"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor={`feedback-${teamId}`}
              className="text-[10px] font-black tracking-widest text-zinc-500 uppercase"
            >
              {t('feedbackLabel')}
            </Label>
            <div className="relative">
              <FileEdit className="absolute top-3.5 left-3 size-4 text-zinc-400" />
              <Textarea
                id={`feedback-${teamId}`}
                rows={3}
                className="resize-none rounded-none border-2 border-zinc-200 p-3 pl-10 text-sm transition-colors hover:border-zinc-300 focus-visible:ring-purple-500 dark:border-zinc-800 dark:hover:border-zinc-700"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="unstyled"
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-none border-transparent bg-zinc-900 text-[11px] font-black tracking-wider text-white uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:bg-purple-600 hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:hover:bg-purple-600"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {t('saving')}
              </>
            ) : (
              t('btnSave')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
