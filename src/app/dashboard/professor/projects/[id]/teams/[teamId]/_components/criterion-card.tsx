import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CriterionCardProps {
  criterion: {
    id: number;
    name: string;
    description?: string | null;
    maxPoints: number;
  };
  scoreData: {
    score?: number;
    comment?: string;
  };
  error?: string;
  onScoreChange: (id: number, value: string) => void;
  onCommentChange: (id: number, value: string) => void;
  readOnly?: boolean;
}

/**
 * Renders an input form for a single grading criterion.
 * Handles numeric validation limits, displays potential error flags,
 * and allows supervisors to comment on individual marks.
 */
export function CriterionCard({
  criterion,
  scoreData,
  error,
  onScoreChange,
  onCommentChange,
  readOnly = false,
}: CriterionCardProps) {
  const t = useTranslations('ProfessorCriterionCard');

  return (
    <Card
      className={`rounded-none border-2 transition-all ${
        error
          ? 'border-red-500/40 bg-red-500/[0.02]'
          : scoreData.score !== undefined
            ? 'border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:border-zinc-800'
            : 'border-zinc-200 dark:border-zinc-800'
      } bg-card hover:shadow-none`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold tracking-wider text-zinc-900 uppercase dark:text-zinc-50">
            {criterion.name}
          </CardTitle>
          {criterion.description && (
            <p className="max-w-2xl text-xs leading-relaxed font-medium text-zinc-400 dark:text-zinc-500">
              {criterion.description}
            </p>
          )}
        </div>
        <Badge
          variant="outline"
          className="rounded-none border-zinc-300 px-2 py-0.5 text-[9px] font-bold tracking-wider text-zinc-500 uppercase dark:border-zinc-700"
        >
          {t('maxPoints', { max: criterion.maxPoints })}
        </Badge>
      </CardHeader>
      <CardContent className="grid items-end gap-6 p-6 md:grid-cols-4">
        {/* Score Input Column */}
        <div className="flex flex-col gap-1.5 md:col-span-1">
          <label
            htmlFor={`crit-score-${criterion.id}`}
            className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase"
          >
            {t('scoreLabel', { max: criterion.maxPoints })}
          </label>
          <div className="relative">
            <input
              id={`crit-score-${criterion.id}`}
              aria-label={t('scoreLabel', { max: criterion.maxPoints })}
              type="number"
              step="0.5"
              min="0"
              max={criterion.maxPoints}
              value={scoreData.score !== undefined ? scoreData.score : ''}
              onChange={(e) => onScoreChange(criterion.id, e.target.value)}
              placeholder="—"
              disabled={readOnly}
              aria-invalid={error ? 'true' : undefined}
              className={`w-full border-2 text-sm font-semibold ${
                error
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-zinc-200 focus:border-purple-500 dark:border-zinc-800'
              } bg-card rounded-none p-3 font-mono outline-none disabled:opacity-70`}
            />
          </div>
          {error && (
            <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold tracking-tight text-red-500 uppercase">
              <ShieldAlert className="size-3.5" />
              {error}
            </p>
          )}
        </div>

        {/* Feedback Comment Column */}
        <div className="flex flex-col gap-1.5 md:col-span-3">
          <label
            htmlFor={`crit-comment-${criterion.id}`}
            className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase"
          >
            {t('comments')}
          </label>
          <input
            id={`crit-comment-${criterion.id}`}
            aria-label={t('comments')}
            type="text"
            value={scoreData.comment || ''}
            disabled={readOnly}
            onChange={(e) => onCommentChange(criterion.id, e.target.value)}
            className="bg-card w-full rounded-none border-2 border-zinc-200 p-3 text-xs font-medium outline-none focus:border-purple-500 disabled:opacity-70 dark:border-zinc-800"
          />
        </div>
      </CardContent>
    </Card>
  );
}
