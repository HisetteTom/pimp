import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShieldAlert } from "lucide-react";

interface CriterionCardProps {
  criterion: {
    id: number;
    name: string;
    description?: string;
    maxPoints: number;
  };
  scoreData: {
    score?: number;
    comment?: string;
  };
  error?: string;
  onScoreChange: (id: number, value: string) => void;
  onCommentChange: (id: number, value: string) => void;
}

export function CriterionCard({
  criterion,
  scoreData,
  error,
  onScoreChange,
  onCommentChange,
}: CriterionCardProps) {
  return (
    <Card
      className={`border-2 rounded-none transition-all ${
        error
          ? "border-red-500/40 bg-red-500/[0.02]"
          : scoreData.score !== undefined
          ? "border-zinc-200 dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
          : "border-zinc-200 dark:border-zinc-800"
      } bg-card hover:shadow-none`}
    >
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 py-4 px-6 flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
            {criterion.name}
          </CardTitle>
          {criterion.description && (
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-2xl">
              {criterion.description}
            </p>
          )}
        </div>
        <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-500 font-bold text-[9px] uppercase tracking-wider rounded-none py-0.5 px-2">
          Max: {criterion.maxPoints} pts
        </Badge>
      </CardHeader>
      <CardContent className="p-6 grid gap-6 md:grid-cols-4 items-end">
        {/* Score Input Column */}
        <div className="md:col-span-1 flex flex-col gap-1.5">
          <label
            htmlFor={`crit-score-${criterion.id}`}
            className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1"
          >
            Score (0-{criterion.maxPoints})
          </label>
          <div className="relative">
            <input
              id={`crit-score-${criterion.id}`}
              type="number"
              step="0.5"
              min="0"
              max={criterion.maxPoints}
              value={scoreData.score !== undefined ? scoreData.score : ""}
              onChange={(e) => onScoreChange(criterion.id, e.target.value)}
              placeholder="—"
              aria-invalid={error ? "true" : undefined}
              className={`w-full text-sm font-semibold border-2 ${
                error ? "border-red-500 focus:border-red-600" : "border-zinc-200 dark:border-zinc-800 focus:border-purple-500"
              } bg-card p-3 outline-none rounded-none font-mono`}
            />
          </div>
          {error && (
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight flex items-center gap-1 mt-0.5">
              <ShieldAlert className="size-3.5" />
              {error}
            </p>
          )}
        </div>

        {/* Feedback Comment Column */}
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label
            htmlFor={`crit-comment-${criterion.id}`}
            className="text-[10px] font-bold uppercase tracking-wider text-zinc-400"
          >
            Comments
          </label>
          <input
            id={`crit-comment-${criterion.id}`}
            type="text"
            value={scoreData.comment || ""}
            onChange={(e) => onCommentChange(criterion.id, e.target.value)}
            className="w-full text-xs font-medium border-2 border-zinc-200 dark:border-zinc-800 focus:border-purple-500 bg-card p-3 outline-none rounded-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
