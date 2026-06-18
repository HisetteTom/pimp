'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash, Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Criterion {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
  maxPoints: number;
}

interface CriterionRowProps {
  criterion: Criterion;
  isEditing: boolean;
  isPending: boolean;
  editName: string;
  editDescription: string;
  editMaxPoints: number;
  onNameChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onMaxPointsChange: (val: number) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

/**
 * Component representing a single criterion row item in the setup view.
 * Supports inline editing or deletion.
 */
export function CriterionRow({
  criterion,
  isEditing,
  isPending,
  editName,
  editDescription,
  editMaxPoints,
  onNameChange,
  onDescriptionChange,
  onMaxPointsChange,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: CriterionRowProps) {
  const t = useTranslations('ProfessorCriterionRowSetup');

  if (isEditing) {
    return (
      <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:border-zinc-800">
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5 sm:col-span-3">
              <Label
                htmlFor={`edit-name-${criterion.id}`}
                className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase"
              >
                {t('fieldName')}
              </Label>
              <Input
                id={`edit-name-${criterion.id}`}
                value={editName}
                onChange={(e) => onNameChange(e.target.value)}
                className="h-9 rounded-none border-2 border-zinc-200 font-semibold focus-visible:border-purple-500 focus-visible:ring-0 dark:border-zinc-800"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor={`edit-points-${criterion.id}`}
                className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase"
              >
                {t('fieldPoints')}
              </Label>
              <Input
                id={`edit-points-${criterion.id}`}
                type="number"
                min="1"
                value={editMaxPoints}
                onChange={(e) => onMaxPointsChange(parseInt(e.target.value) || 0)}
                className="h-9 rounded-none border-2 border-zinc-200 font-semibold focus-visible:border-purple-500 focus-visible:ring-0 dark:border-zinc-800"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor={`edit-desc-${criterion.id}`}
              className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase"
            >
              {t('fieldDesc')}
            </Label>
            <Textarea
              id={`edit-desc-${criterion.id}`}
              value={editDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={2}
              className="resize-none rounded-none border-2 border-zinc-200 text-xs font-medium focus-visible:border-purple-500 focus-visible:ring-0 dark:border-zinc-800"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="unstyled"
              onClick={onUpdate}
              disabled={isPending}
              className="flex h-9 items-center justify-center gap-2 bg-zinc-900 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
              {t('btnSave')}
            </Button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="cursor-pointer px-4 py-2 text-xs font-bold tracking-wider text-zinc-500 uppercase hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {t('btnCancel')}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-card flex items-start justify-between gap-4 border-2 border-zinc-200 p-5 transition-all hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600">
      <div className="space-y-1.5 pr-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h4 className="text-[13px] font-semibold text-zinc-900 uppercase dark:text-zinc-100">
            {criterion.name}
          </h4>
          <Badge className="rounded-none border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-zinc-700 uppercase dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {t('maxPoints', { max: criterion.maxPoints })}
          </Badge>
        </div>
        {criterion.description && (
          <p className="text-xs font-medium text-zinc-500">{criterion.description}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onStartEdit}
          title={t('edit')}
          className="flex size-8 cursor-pointer items-center justify-center rounded border border-zinc-200 text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
        >
          <Edit2 className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title={t('delete')}
          className="flex size-8 cursor-pointer items-center justify-center rounded border border-rose-200 text-rose-500/80 transition-all hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
