'use client';

import { useTransition, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateProjectStatus } from '../../actions';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowUpDown } from 'lucide-react';

interface ProjectStatusSelectorProps {
  projectId: number;
  initialStatus: string;
}

export function ProjectStatusSelector({ projectId, initialStatus }: ProjectStatusSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(initialStatus);

  const statuses = [
    { value: 'proposed', label: 'Proposed' },
    { value: 'validated', label: 'Validated' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'late', label: 'Late (Warning)' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'presented', label: 'Presented' },
    { value: 'closed', label: 'Closed' },
  ];

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      setOptimisticStatus(newStatus);
      try {
        await updateProjectStatus(projectId, newStatus);
        toast.success(`Project status updated to ${newStatus}`);
        refresh();
      } catch (err) {
        toast.error('Failed to update project status');
        console.error(err);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1.5 sm:w-[220px]">
      <Label
        htmlFor="status-select"
        className="text-[10px] font-black tracking-widest text-zinc-400 uppercase"
      >
        Project Status
      </Label>
      <div className="relative flex items-center">
        <select
          id="status-select"
          value={optimisticStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isPending}
          className="bg-card h-11 w-full cursor-pointer appearance-none rounded-none border-2 border-zinc-200 pr-10 pl-4 text-xs font-black tracking-widest uppercase transition-colors focus:border-purple-600 focus:outline-none disabled:opacity-50 dark:border-zinc-800 dark:focus:border-purple-600"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value} className="py-2 font-bold">
              {s.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3.5 text-zinc-400">
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
