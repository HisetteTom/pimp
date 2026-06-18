'use client';

import { useTransition, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateProjectStatus } from '../../actions';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProjectStatusSelectorProps {
  projectId: number;
  initialStatus: string;
}

const statuses = [
  { value: 'proposed', key: 'proposed' },
  { value: 'validated', key: 'validated' },
  { value: 'ongoing', key: 'ongoing' },
  { value: 'late', key: 'late' },
  { value: 'delivered', key: 'delivered' },
  { value: 'presented', key: 'presented' },
  { value: 'closed', key: 'closed' },
];

/**
 * ProjectStatusSelector allows professors to update a project's operational phase.
 * It uses useOptimistic to provide immediate visual feedback during the state transition
 * and invokes updateProjectStatus in a transition boundary.
 */
export function ProjectStatusSelector({ projectId, initialStatus }: ProjectStatusSelectorProps) {
  const t = useTranslations('ProfessorProjectDetail');
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(initialStatus);

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      setOptimisticStatus(newStatus);
      try {
        await updateProjectStatus(projectId, newStatus);
        toast.success(
          t('statusUpdated', {
            status: t(
              newStatus as
                | 'proposed'
                | 'validated'
                | 'ongoing'
                | 'late'
                | 'delivered'
                | 'presented'
                | 'closed',
            ),
          }),
        );
        refresh();
      } catch (err) {
        toast.error(t('statusUpdateError'));
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
        {t('projectStatus')}
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
              {t(
                s.key as
                  | 'proposed'
                  | 'validated'
                  | 'ongoing'
                  | 'late'
                  | 'delivered'
                  | 'presented'
                  | 'closed',
              )}
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
