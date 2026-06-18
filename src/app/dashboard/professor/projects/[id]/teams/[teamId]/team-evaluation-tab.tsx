'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { saveTeamEvaluation } from '../../../../evaluation-actions';
import { EvaluationMetrics } from './_components/evaluation-metrics';
import { EvaluationCriteriaGrid } from './_components/evaluation-criteria-grid';
import { GlobalRemarksCard } from './_components/global-remarks-card';
import { useTranslations } from 'next-intl';

interface TeamEvaluationTabProps {
  projectId: number;
  teamId: number;
  criteria: { id: number; name: string; description?: string | null; maxPoints: number }[];
  initialScores: { criterionId: number; score?: number | null; comment?: string | null }[];
  team: { feedback?: string | null; notes?: string | null; grade?: string | null };
  role: string;
}

/**
 * Renders the primary evaluation tab interface.
 * Coordinates criterion-specific scoring, global feedback textareas,
 * live score-to-grade aggregation, and input constraint validation.
 * Persists data via the saveTeamEvaluation server action.
 */
export function TeamEvaluationTab({
  projectId,
  teamId,
  criteria,
  initialScores,
  team,
  role = 'professor',
}: TeamEvaluationTabProps) {
  const t = useTranslations('ProfessorTeamEvaluationTab');
  const { refresh } = useRouter();
  const [isPending, startTransition] = useTransition();

  // Initialize individual criterion scores & comments
  const [scores, setScores] = useState<Record<number, { score?: number; comment?: string }>>(() => {
    const initialMap: Record<number, { score?: number; comment?: string }> = {};
    criteria.forEach((c) => {
      const match = initialScores.find((s) => s.criterionId === c.id);
      initialMap[c.id] = {
        score: match?.score !== null && match?.score !== undefined ? match.score : undefined,
        comment: match?.comment || '',
      };
    });
    return initialMap;
  });

  // Initialize global values
  const [juryFeedback, setJuryFeedback] = useState(team.feedback || '');
  const [supervisorNotes, setSupervisorNotes] = useState(team.notes || '');

  // Handle score change
  const handleScoreChange = (criterionId: number, value: string) => {
    const numVal = value === '' ? undefined : parseFloat(value);
    setScores((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        score: numVal === undefined || isNaN(numVal) ? undefined : numVal,
      },
    }));
  };

  // Handle comment change
  const handleCommentChange = (criterionId: number, comment: string) => {
    setScores((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        comment,
      },
    }));
  };

  // Live total score calculators
  const totalScoreInfo = (() => {
    let currentSum = 0;
    let maxSum = 0;
    let anyAssigned = false;

    criteria.forEach((c) => {
      maxSum += c.maxPoints || 20;
      const scoreObj = scores[c.id];
      if (scoreObj && scoreObj.score !== undefined) {
        currentSum += scoreObj.score;
        anyAssigned = true;
      }
    });

    return {
      currentSum,
      maxSum,
      anyAssigned,
      percentage: maxSum > 0 ? ((currentSum / maxSum) * 100).toFixed(1) : '0',
    };
  })();

  const globalGrade = (() => {
    if (!totalScoreInfo.anyAssigned || totalScoreInfo.maxSum === 0) return '';
    const normalized = (totalScoreInfo.currentSum / totalScoreInfo.maxSum) * 20;
    return `${parseFloat(normalized.toFixed(2))}/20`;
  })();

  const validationErrors = (() => {
    const errors: Record<number, string> = {};
    criteria.forEach((c) => {
      const scoreObj = scores[c.id];
      if (scoreObj && scoreObj.score !== undefined) {
        if (scoreObj.score < 0) {
          errors[c.id] = t('errNegative');
        } else if (scoreObj.score > c.maxPoints) {
          errors[c.id] = t('errExceed', { max: c.maxPoints });
        }
      }
    });
    return errors;
  })();

  const hasErrors = Object.keys(validationErrors).length > 0;

  // Handle Save Action
  const handleSave = () => {
    if (hasErrors) {
      toast.error(t('validationError'));
      return;
    }

    startTransition(async () => {
      try {
        const payloadScores = Object.entries(scores).map(([critId, data]) => ({
          criterionId: parseInt(critId),
          score: data.score,
          comment: data.comment,
        }));

        await saveTeamEvaluation({
          teamId,
          projectId,
          scores: payloadScores,
          globalGrade: globalGrade, // Drizzle grade field in team schema is text
          juryFeedback,
          supervisorNotes,
        });

        toast.success(t('saveSuccess'));
        refresh();
      } catch (err) {
        toast.error(t('saveError'));
        console.error(err);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Live Grade Calculator Card */}
      <EvaluationMetrics totalScoreInfo={totalScoreInfo} />

      {/* Main Grid Criteria Form */}
      <EvaluationCriteriaGrid
        criteria={criteria}
        scores={scores}
        validationErrors={validationErrors}
        onScoreChange={handleScoreChange}
        onCommentChange={handleCommentChange}
        readOnly={role === 'jury'}
      />

      {/* Global Grade and General Remarks */}
      <GlobalRemarksCard
        globalGrade={globalGrade}
        juryFeedback={juryFeedback}
        setJuryFeedback={setJuryFeedback}
        supervisorNotes={supervisorNotes}
        setSupervisorNotes={setSupervisorNotes}
        role={role}
      />

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={isPending || hasErrors}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-zinc-900 px-6 py-2.5 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-zinc-800 sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {t('btnSave')}
        </Button>
      </div>
    </div>
  );
}
