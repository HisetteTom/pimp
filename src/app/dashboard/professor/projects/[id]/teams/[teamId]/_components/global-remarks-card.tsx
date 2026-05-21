import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface GlobalRemarksCardProps {
  globalGrade: string;
  juryFeedback: string;
  setJuryFeedback: (val: string) => void;
  supervisorNotes: string;
  setSupervisorNotes: (val: string) => void;
}

export function GlobalRemarksCard({
  globalGrade,
  juryFeedback,
  setJuryFeedback,
  supervisorNotes,
  setSupervisorNotes,
}: GlobalRemarksCardProps) {
  return (
    <Card className="border-2 border-zinc-200 dark:border-zinc-800 bg-card rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-none transition-shadow">
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 py-4 px-6 flex flex-row items-center gap-2">
        <MessageSquare className="size-4 text-purple-500" />
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
          Global Grade & General Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Note Globale — auto-calculated */}
          <div className="md:col-span-1 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Overall Grade (Auto)
            </span>
            <div className="w-full text-lg font-black font-mono border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-none text-zinc-900 dark:text-zinc-100">
              {globalGrade || "—"}
            </div>
          </div>

          {/* Jury Comments */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label htmlFor="jury-feedback" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Jury General Feedback / Remarks
            </label>
            <Textarea
              id="jury-feedback"
              rows={3}
              value={juryFeedback}
              onChange={(e) => setJuryFeedback(e.target.value)}
              placeholder="Enter jury general comments, positive feedback, and critiques..."
              className="border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-purple-500 rounded-none p-3 resize-none bg-card text-xs font-mono font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* Supervisor Notes */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
          <label htmlFor="supervisor-notes" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Supervisor Private Observations
          </label>
          <Textarea
            id="supervisor-notes"
            rows={4}
            value={supervisorNotes}
            onChange={(e) => setSupervisorNotes(e.target.value)}
            placeholder="Internal supervisor notes (observations, process notes, etc.)..."
            className="border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-purple-500 rounded-none p-3 resize-y bg-card text-xs font-mono font-medium leading-relaxed"
          />
        </div>
      </CardContent>
    </Card>
  );
}
