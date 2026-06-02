'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Checkpoint {
  id: string;
  title: string;
  dueDate: string;
}

interface CheckpointsEditorProps {
  checkpoints: Checkpoint[];
  isPending: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'title' | 'dueDate', value: string) => void;
}

export function CheckpointsEditor({
  checkpoints,
  isPending,
  onAdd,
  onRemove,
  onUpdate,
}: CheckpointsEditorProps) {
  const t = useTranslations('ProfessorCheckpointsEditor');

  return (
    <div className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-black tracking-widest text-zinc-500 uppercase">
          {t('title')}
        </Label>
        <Button
          type="button"
          variant="unstyled"
          size="sm"
          onClick={onAdd}
          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-none border-2 border-zinc-200 px-3 text-[10px] font-black tracking-wider uppercase hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
          disabled={isPending}
        >
          <Plus className="size-3.5" />
          {t('addCheckpoint')}
        </Button>
      </div>

      {checkpoints.length === 0 ? (
        <p className="text-[10px] font-bold text-zinc-400 uppercase italic">{t('emptyText')}</p>
      ) : (
        <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
          {checkpoints.map((cp) => (
            <div key={cp.id} className="flex items-center gap-2">
              <Input
                type="text"
                className="h-10 rounded-none border-2 border-zinc-200 text-xs transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
                value={cp.title}
                onChange={(e) => onUpdate(cp.id, 'title', e.target.value)}
                required
                disabled={isPending}
                placeholder={t('titlePlaceholder')}
              />
              <Input
                type="date"
                className="h-10 w-40 rounded-none border-2 border-zinc-200 text-xs transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
                value={cp.dueDate}
                onChange={(e) => onUpdate(cp.id, 'dueDate', e.target.value)}
                required
                disabled={isPending}
              />
              <Button
                type="button"
                variant="unstyled"
                size="icon"
                onClick={() => onRemove(cp.id)}
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-none border-2 border-zinc-200 text-red-500 hover:bg-red-50 dark:border-zinc-800 dark:hover:bg-red-950"
                disabled={isPending}
              >
                <Trash className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
