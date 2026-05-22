"use client";

import { useTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProjectStatus } from "../../actions";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowUpDown } from "lucide-react";

interface ProjectStatusSelectorProps {
  projectId: number;
  initialStatus: string;
}

export function ProjectStatusSelector({
  projectId,
  initialStatus,
}: ProjectStatusSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(initialStatus);

  const statuses = [
    { value: "proposed", label: "Proposed" },
    { value: "validated", label: "Validated" },
    { value: "ongoing", label: "Ongoing" },
    { value: "late", label: "Late (Warning)" },
    { value: "delivered", label: "Delivered" },
    { value: "presented", label: "Presented" },
    { value: "closed", label: "Closed" },
  ];

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      setOptimisticStatus(newStatus);
      try {
        await updateProjectStatus(projectId, newStatus);
        toast.success(`Project status updated to ${newStatus}`);
        refresh();
      } catch (err) {
        toast.error("Failed to update project status");
        console.error(err);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1.5 sm:w-[220px]">
      <Label htmlFor="status-select" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
        Project Status
      </Label>
      <div className="relative flex items-center">
        <select
          id="status-select"
          value={optimisticStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isPending}
          className="w-full h-11 pl-4 pr-10 border-2 border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-600 dark:focus:border-purple-600 bg-card font-black uppercase text-xs tracking-widest transition-colors rounded-none appearance-none cursor-pointer disabled:opacity-50"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value} className="font-bold py-2">
              {s.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-zinc-400">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowUpDown className="size-4" />
          )}
        </div>
      </div>
    </div>
  );
}
