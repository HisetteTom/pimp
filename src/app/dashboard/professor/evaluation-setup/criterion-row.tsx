"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash, Check, Loader2 } from "lucide-react";

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
  if (isEditing) {
    return (
      <Card className="border-2 border-zinc-200 dark:border-zinc-800 rounded-none bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3 space-y-1.5">
              <Label htmlFor={`edit-name-${criterion.id}`} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Criterion Name
              </Label>
              <Input
                id={`edit-name-${criterion.id}`}
                value={editName}
                onChange={(e) => onNameChange(e.target.value)}
                className="rounded-none border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-purple-500 h-9 font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`edit-points-${criterion.id}`} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Max Points
              </Label>
              <Input
                id={`edit-points-${criterion.id}`}
                type="number"
                min="1"
                value={editMaxPoints}
                onChange={(e) => onMaxPointsChange(parseInt(e.target.value) || 0)}
                className="rounded-none border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-purple-500 h-9 font-semibold"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`edit-desc-${criterion.id}`} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Description (Optional)
            </Label>
            <Textarea
              id={`edit-desc-${criterion.id}`}
              value={editDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={2}
              className="rounded-none border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-purple-500 font-medium text-xs resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="unstyled"
              onClick={onUpdate}
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 transition-all h-9"
            >
              {isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
              Save Changes
            </Button>
            <button
              onClick={onCancelEdit}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border-2 border-zinc-200 dark:border-zinc-800 bg-card p-5 flex items-start justify-between gap-4 transition-all hover:border-zinc-400 dark:hover:border-zinc-600">
      <div className="space-y-1.5 pr-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h4 className="text-[13px] font-semibold uppercase text-zinc-900 dark:text-zinc-100">
            {criterion.name}
          </h4>
          <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-bold text-[9px] uppercase tracking-wider rounded-none px-2.5 py-0.5">
            Score Max: {criterion.maxPoints} pts
          </Badge>
        </div>
        {criterion.description && (
          <p className="text-xs font-medium text-zinc-500">
            {criterion.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onStartEdit}
          title="Edit Criterion"
          className="size-8 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-center transition-all cursor-pointer"
        >
          <Edit2 className="size-3.5" />
        </button>
        <button
          onClick={onDelete}
          title="Delete Criterion"
          className="size-8 rounded border border-rose-200 text-rose-500/80 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer"
        >
          <Trash className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
