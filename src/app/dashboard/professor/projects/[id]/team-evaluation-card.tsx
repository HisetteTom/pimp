"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { evaluateTeam } from "../../actions";
import { Loader2, Award, FileEdit } from "lucide-react";

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
  initialGrade = "",
  initialFeedback = "",
}: TeamEvaluationCardProps) {
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const [grade, setGrade] = useState(initialGrade || "");
  const [feedback, setFeedback] = useState(initialFeedback || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (grade && (parseFloat(grade) < 0 || parseFloat(grade) > 20)) {
      toast.error("Grade must be between 0 and 20");
      return;
    }

    startTransition(async () => {
      try {
        await evaluateTeam(teamId, grade, feedback, projectId);
        toast.success(`Successfully updated evaluation for ${teamName}`);
        refresh();
      } catch (err) {
        toast.error("Failed to save evaluation");
        console.error(err);
      }
    });
  };

  const isEvaluated = initialGrade || initialFeedback;

  return (
    <Card className={`border-2 rounded-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.03)] hover:shadow-none ${isEvaluated ? "border-purple-500/30 bg-purple-500/[0.01]" : "border-zinc-200 dark:border-zinc-800"}`}>
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Award className="size-4 text-purple-600" />
          <CardTitle className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
            Team Evaluation
          </CardTitle>
        </div>
        <CardDescription className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Input the final cohort grade out of 20 and review comments.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`grade-${teamId}`} className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Grade (Score / 20)
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-[13px] font-black text-zinc-400">/20</span>
              <Input
                id={`grade-${teamId}`}
                type="number"
                step="0.25"
                min="0"
                max="20"
                className="pl-12 h-11 border-2 focus-visible:ring-purple-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors rounded-none font-bold"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`feedback-${teamId}`} className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Professor Feedback
            </Label>
            <div className="relative">
              <FileEdit className="absolute left-3 top-3.5 size-4 text-zinc-400" />
              <Textarea
                id={`feedback-${teamId}`}
                rows={3}
                className="pl-10 border-2 focus-visible:ring-purple-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors rounded-none p-3 resize-none text-sm"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-zinc-900 hover:bg-purple-600 text-white font-black uppercase tracking-wider text-[11px] transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 rounded-none cursor-pointer"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Evaluation"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
