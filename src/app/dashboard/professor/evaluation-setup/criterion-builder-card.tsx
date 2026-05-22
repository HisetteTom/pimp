"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Check, Loader2 } from "lucide-react";

interface CriterionBuilderCardProps {
  newName: string;
  newDescription: string;
  newMaxPoints: number;
  isPending: boolean;
  onNameChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onMaxPointsChange: (val: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CriterionBuilderCard({
  newName,
  newDescription,
  newMaxPoints,
  isPending,
  onNameChange,
  onDescriptionChange,
  onMaxPointsChange,
  onSave,
  onCancel,
}: CriterionBuilderCardProps) {
  return (
    <Card className="border-2 border-purple-600 rounded-none shadow-[4px_4px_0px_0px_#a855f7]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-widest text-purple-600">
            New Criterion Builder
          </CardTitle>
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3 space-y-1.5">
            <Label htmlFor="new-name" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Criterion Name
            </Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => onNameChange(e.target.value)}
              className="rounded-none border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-purple-600 h-9 font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-points" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Max Points
            </Label>
            <Input
              id="new-points"
              type="number"
              min="1"
              value={newMaxPoints}
              onChange={(e) => onMaxPointsChange(parseInt(e.target.value) || 0)}
              className="rounded-none border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-purple-600 h-9 font-bold"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-desc" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Description (Optional)
          </Label>
          <Textarea
            id="new-desc"
            value={newDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={2}
            className="rounded-none border-2 border-zinc-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-purple-600 font-medium text-xs resize-none"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="unstyled"
            onClick={onSave}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-purple-600 text-white hover:bg-purple-700 active:scale-95 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] h-9"
          >
            {isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Check className="size-3" />
            )}
            Save Grid Element
          </Button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
