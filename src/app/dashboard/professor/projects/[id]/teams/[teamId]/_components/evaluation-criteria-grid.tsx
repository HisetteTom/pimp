import { Card } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';
import { CriterionCard } from './criterion-card';

interface EvaluationCriteriaGridProps {
  criteria: { id: number; name: string; description?: string | null; maxPoints: number }[];
  scores: Record<number, { score?: number; comment?: string }>;
  validationErrors: Record<number, string>;
  onScoreChange: (id: number, value: string) => void;
  onCommentChange: (id: number, value: string) => void;
}

export function EvaluationCriteriaGrid({
  criteria,
  scores,
  validationErrors,
  onScoreChange,
  onCommentChange,
}: EvaluationCriteriaGridProps) {
  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold tracking-widest text-zinc-400 uppercase">
        <ClipboardCheck className="size-5" />
        Evaluation Criteria Grid
      </h3>

      {criteria.length === 0 ? (
        <Card className="rounded-none border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-zinc-440 text-sm font-bold tracking-wide uppercase italic">
            No evaluation criteria set for this project yet.
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Professors can configure evaluation criteria grids in the sidebar setup page.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {criteria.map((c) => {
            const scoreData = scores[c.id] || { score: undefined, comment: '' };
            const error = validationErrors[c.id];

            return (
              <CriterionCard
                key={c.id}
                criterion={c}
                scoreData={scoreData}
                error={error}
                onScoreChange={onScoreChange}
                onCommentChange={onCommentChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
