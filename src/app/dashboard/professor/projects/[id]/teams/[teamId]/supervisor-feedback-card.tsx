import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { evaluateTeam } from "../../../../actions";
import { Loader2, Save } from "lucide-react";

interface SupervisorFeedbackCardProps {
  teamId: number;
  projectId: number;
  teamName: string;
  initialFeedback?: string | null;
  type: "overview" | "kanban" | "deliverables";
}

export function SupervisorFeedbackCard({
  teamId,
  projectId,
  teamName,
  initialFeedback = "",
  type,
}: SupervisorFeedbackCardProps) {
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const parsedFeedbacks = useMemo(() => {
    try {
      if (!initialFeedback) return { overview: "", kanban: "", deliverables: "" };
      const parsed = JSON.parse(initialFeedback);
      if (parsed && typeof parsed === 'object') {
        return {
          overview: parsed.overview || "",
          kanban: parsed.kanban || parsed.tasks || "",
          deliverables: parsed.deliverables || "",
        };
      }
    } catch (e) {
      // legacy string fallback
    }
    return { overview: initialFeedback || "", kanban: "", deliverables: "" };
  }, [initialFeedback]);

  const currentInitialText = parsedFeedbacks[type] || "";
  const [feedback, setFeedback] = useState(currentInitialText);

  const handleSave = () => {
    startTransition(async () => {
      try {
        const updated = {
          ...parsedFeedbacks,
          [type]: feedback,
        };
        // Passing null for grade since we are completely removing the grading system
        await evaluateTeam(teamId, null as any, JSON.stringify(updated), projectId);
        toast.success("Feedback updated successfully!");
        refresh();
      } catch (err) {
        toast.error("Failed to update feedback.");
        console.error(err);
      }
    });
  };

  const isChanged = feedback !== currentInitialText;

  const typeLabels: Record<string, string> = {
    overview: "General Overview Written Feedback",
    kanban: "Tasks & Kanban Board Progress Feedback",
    deliverables: "Deliverables & Submissions Feedback",
  };

  return (
    <Card className="group relative overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/50 rounded-none w-full">
      {/* SVG grid graphic */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.1]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`feedback-grid-${teamId}-${type}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#feedback-grid-${teamId}-${type})`} />
        </svg>
      </div>

      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 py-3.5 px-6 relative z-10">
        <CardTitle className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Supervisor Evaluation ({type})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-4 gap-y-0.01 relative z-10 flex flex-col">
        <div className="space-y-0.5">
          <label htmlFor={`written-feedback-${type}`} className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            {typeLabels[type]}
          </label>
          <Textarea
            id={`written-feedback-${type}`}
            rows={5}
            className="border border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-none p-3 resize-y bg-zinc-50/50 dark:bg-zinc-900/10 text-sm"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isPending}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending || !isChanged}
          className="w-full h-12 text-sm font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider rounded-none cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save {type} Comments
        </Button>
      </CardContent>
    </Card>
  );
}

