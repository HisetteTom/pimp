"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { validateDeliverable } from "../../actions";
import { Loader2, ExternalLink, CheckSquare, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeliverableReviewerProps {
  deliverableId: number;
  projectId: number;
  deliverableName: string;
  deliverableSource?: string | null;
  initialStatus: string;
  initialFeedback?: string | null;
}

export function DeliverableReviewer({
  deliverableId,
  projectId,
  deliverableName,
  deliverableSource = "",
  initialStatus,
  initialFeedback = "",
}: DeliverableReviewerProps) {
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const [status, setStatus] = useState(initialStatus || "pending");
  const [feedback, setFeedback] = useState(initialFeedback || "");

  const handleValidate = (newStatus: string) => {
    startTransition(async () => {
      try {
        await validateDeliverable(deliverableId, newStatus, feedback, projectId);
        setStatus(newStatus);
        toast.success(`Deliverable "${deliverableName}" marked as ${newStatus}`);
        refresh();
      } catch (err) {
        toast.error("Failed to update deliverable status");
        console.error(err);
      }
    });
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "approved":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[9px] tracking-wider rounded-none">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[9px] tracking-wider rounded-none">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-[9px] tracking-wider rounded-none">Pending Review</Badge>;
    }
  };

  return (
    <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.02)] transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-tight text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            {deliverableName}
            {getStatusBadge(status)}
          </h4>
          {deliverableSource && (
            <a
              href={deliverableSource}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-700 underline decoration-2 underline-offset-2 mt-1 uppercase"
            >
              <ExternalLink className="size-3" />
              Open Submission Resource
            </a>
          )}
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <div className="space-y-1.5">
          <Label htmlFor={`deliv-feed-${deliverableId}`} className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
            Review Comments / Feedback
          </Label>
          <Textarea
            id={`deliv-feed-${deliverableId}`}
            rows={2}
            className="border-2 focus-visible:ring-purple-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors rounded-none p-2 resize-none text-xs bg-card"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => handleValidate("approved")}
            disabled={isPending}
            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-wider rounded-none shadow-[2px_2px_0px_0px_rgba(16,185,129,0.2)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center gap-1"
          >
            {isPending && status === "approved" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <CheckSquare className="size-3" />
            )}
            Approve
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleValidate("rejected")}
            disabled={isPending}
            className="h-8 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-wider rounded-none shadow-[2px_2px_0px_0px_rgba(239,68,68,0.2)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center gap-1"
          >
            {isPending && status === "rejected" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <XCircle className="size-3" />
            )}
            Reject
          </Button>

          {status !== "pending" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleValidate("pending")}
              disabled={isPending}
              className="h-8 border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider rounded-none cursor-pointer flex items-center gap-1"
            >
              {isPending && status === "pending" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <AlertCircle className="size-3" />
              )}
              Reset to Pending
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
