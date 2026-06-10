import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GlobalRemarksCardProps {
  globalGrade: string;
  juryFeedback: string;
  setJuryFeedback: (val: string) => void;
  supervisorNotes: string;
  setSupervisorNotes: (val: string) => void;
  role?: string;
}

export function GlobalRemarksCard({
  globalGrade,
  juryFeedback,
  setJuryFeedback,
  supervisorNotes,
  setSupervisorNotes,
  role = 'professor',
}: GlobalRemarksCardProps) {
  const t = useTranslations('ProfessorGlobalRemarksCard');

  return (
    <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <MessageSquare className="size-4 text-purple-500" />
        <CardTitle className="text-sm font-semibold tracking-wider text-zinc-900 uppercase dark:text-zinc-50">
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Note Globale — auto-calculated */}
          <div className="flex flex-col gap-1.5 md:col-span-1">
            <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              {t('gradeAuto')}
            </span>
            <div className="w-full rounded-none border-2 border-zinc-200 bg-zinc-50 p-3 font-mono text-lg font-black text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
              {globalGrade || '—'}
            </div>
          </div>

          {/* Jury Comments */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label
              htmlFor="jury-feedback"
              className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase"
            >
              {t('juryTitle')}
            </label>
            <Textarea
              id="jury-feedback"
              rows={3}
              value={juryFeedback}
              onChange={(e) => setJuryFeedback(e.target.value)}
              placeholder={t('juryPlaceholder')}
              className="bg-card resize-none rounded-none border-2 border-zinc-200 p-3 font-mono text-xs leading-relaxed font-medium focus-visible:ring-purple-500 dark:border-zinc-800"
            />
          </div>
        </div>

        {/* Supervisor Notes */}
        <div className="flex flex-col gap-1.5 border-t border-dashed border-zinc-200 pt-4 dark:border-zinc-800">
          <label
            htmlFor="supervisor-notes"
            className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase"
          >
            {t('supervisorTitle')}
          </label>
          <Textarea
            id="supervisor-notes"
            rows={4}
            value={supervisorNotes}
            disabled={role === 'jury'}
            onChange={(e) => setSupervisorNotes(e.target.value)}
            placeholder={t('supervisorPlaceholder')}
            className="bg-card resize-y rounded-none border-2 border-zinc-200 p-3 font-mono text-xs leading-relaxed font-medium focus-visible:ring-purple-500 disabled:opacity-70 dark:border-zinc-800"
          />
        </div>
      </CardContent>
    </Card>
  );
}
