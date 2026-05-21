import { Card } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";
import { CriterionCard } from "./criterion-card";

interface EvaluationCriteriaGridProps {
  criteria: any[];
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
      <h3 className="text-lg font-semibold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
        <ClipboardCheck className="size-5" />
        Evaluation Criteria Grid
      </h3>

      {criteria.length === 0 ? (
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center rounded-none">
          <p className="text-sm font-bold uppercase italic text-zinc-440 tracking-wide">
            No evaluation criteria set for this project yet.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Professors can configure evaluation criteria grids in the sidebar setup page.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {criteria.map((c) => {
            const scoreData = scores[c.id] || { score: undefined, comment: "" };
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
