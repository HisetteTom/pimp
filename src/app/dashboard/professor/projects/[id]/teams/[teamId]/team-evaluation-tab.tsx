"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { saveTeamEvaluation } from "../../../../evaluation-actions";
import { EvaluationMetrics } from "./_components/evaluation-metrics";
import { EvaluationCriteriaGrid } from "./_components/evaluation-criteria-grid";
import { GlobalRemarksCard } from "./_components/global-remarks-card";

interface TeamEvaluationTabProps {
  projectId: number;
  teamId: number;
  criteria: any[];
  initialScores: any[];
  team: any;
  role: string;
}

export function TeamEvaluationTab({
  projectId,
  teamId,
  criteria,
  initialScores,
  team,
  role,
}: TeamEvaluationTabProps) {
  const { refresh } = useRouter();
  const [isPending, startTransition] = useTransition();

  // Initialize individual criterion scores & comments
  const [scores, setScores] = useState<Record<number, { score?: number; comment?: string }>>(() => {
    const initialMap: Record<number, { score?: number; comment?: string }> = {};
    criteria.forEach((c) => {
      const match = initialScores.find((s) => s.criterionId === c.id);
      initialMap[c.id] = {
        score: match?.score !== null && match?.score !== undefined ? match.score : undefined,
        comment: match?.comment || "",
      };
    });
    return initialMap;
  });

  // Initialize global values
  const [juryFeedback, setJuryFeedback] = useState(team.feedback || "");
  const [supervisorNotes, setSupervisorNotes] = useState(team.notes || "");

  // Handle score change
  const handleScoreChange = (criterionId: number, value: string) => {
    const numVal = value === "" ? undefined : parseFloat(value);
    setScores((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        score: isNaN(numVal as any) ? undefined : numVal,
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
  const totalScoreInfo = useMemo(() => {
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
      percentage: maxSum > 0 ? ((currentSum / maxSum) * 100).toFixed(1) : "0",
    };
  }, [criteria, scores]);

  // Auto-calculated global grade normalized to /20
  const globalGrade = useMemo(() => {
    if (!totalScoreInfo.anyAssigned || totalScoreInfo.maxSum === 0) return "";
    const normalized = (totalScoreInfo.currentSum / totalScoreInfo.maxSum) * 20;
    return `${parseFloat(normalized.toFixed(2))}/20`;
  }, [totalScoreInfo]);

  // Validation: Check if any score is out of bounds or negative
  const validationErrors = useMemo(() => {
    const errors: Record<number, string> = {};
    criteria.forEach((c) => {
      const scoreObj = scores[c.id];
      if (scoreObj && scoreObj.score !== undefined) {
        if (scoreObj.score < 0) {
          errors[c.id] = "Score cannot be negative";
        } else if (scoreObj.score > c.maxPoints) {
          errors[c.id] = `Score cannot exceed maximum of ${c.maxPoints}`;
        }
      }
    });
    return errors;
  }, [criteria, scores]);

  const hasErrors = Object.keys(validationErrors).length > 0;

  // Handle Save Action
  const handleSave = () => {
    if (hasErrors) {
      toast.error("Please fix validation errors before saving.");
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
          globalGradeStr: globalGrade, // Drizzle grade field in team schema is text
          juryFeedback,
          supervisorNotes,
        } as any);

        toast.success("Team evaluation grid saved successfully!");
        refresh();
      } catch (err) {
        toast.error("Failed to save team evaluation.");
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
      />

      {/* Global Grade and General Remarks */}
      <GlobalRemarksCard
        globalGrade={globalGrade}
        juryFeedback={juryFeedback}
        setJuryFeedback={setJuryFeedback}
        supervisorNotes={supervisorNotes}
        setSupervisorNotes={setSupervisorNotes}
      />

      {/* Save Button */}
      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isPending || hasErrors}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all uppercase tracking-widest rounded-none cursor-pointer flex items-center justify-center gap-2"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Evaluation Grid
        </Button>
      </div>
    </div>
  );
}
