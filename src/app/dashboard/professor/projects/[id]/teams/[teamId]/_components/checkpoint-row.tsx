'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateCheckpoint, deleteCheckpoint, saveCheckpointNote } from '../../../../../actions';

function formatIsoDate(dateVal: Date | string | number | null | undefined): string {
  if (!dateVal) return '';
  try {
    return new Date(dateVal).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function formatLocalDate(dateVal: Date | string | number | null | undefined): string {
  if (!dateVal) return 'No Date';
  try {
    return new Date(dateVal).toLocaleDateString();
  } catch {
    return 'No Date';
  }
}

export interface CheckpointRowProps {
  checkpoint: {
    id: number;
    title: string;
    description?: string | null;
    dueDate: Date;
    projectId: number;
  };
  teamId: number;
  projectId: number;
  savedNoteText: string;
  onRefresh: () => void;
  readOnly?: boolean;
}

export function CheckpointRow({
  checkpoint,
  teamId,
  projectId,
  savedNoteText,
  onRefresh,
  readOnly = false,
}: CheckpointRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(() => checkpoint.title);
  const [editDueDate, setEditDueDate] = useState(() =>
    checkpoint.dueDate ? formatIsoDate(checkpoint.dueDate) : '',
  );
  const [localNote, setLocalNote] = useState(() => savedNoteText);
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isSavingNote, startSaveNoteTransition] = useTransition();

  const handleUpdate = () => {
    if (readOnly || !editTitle.trim() || !editDueDate) return;
    startUpdateTransition(async () => {
      try {
        await updateCheckpoint(checkpoint.id, editTitle.trim(), editDueDate, projectId);
        toast.success('Checkpoint updated successfully!');
        setIsEditing(false);
        onRefresh();
      } catch {
        toast.error('Failed to update checkpoint.');
      }
    });
  };

  const handleDelete = () => {
    if (readOnly) return;
    if (
      !confirm(
        'Are you sure you want to delete this checkpoint? Notes for this checkpoint across all teams will be deleted.',
      )
    )
      return;
    startDeleteTransition(async () => {
      try {
        await deleteCheckpoint(checkpoint.id, projectId);
        toast.success('Checkpoint deleted successfully!');
        onRefresh();
      } catch {
        toast.error('Failed to delete checkpoint.');
      }
    });
  };

  const handleSaveNote = () => {
    if (readOnly) return;
    startSaveNoteTransition(async () => {
      try {
        await saveCheckpointNote(checkpoint.id, teamId, localNote.trim(), projectId);
        toast.success('Notes saved successfully!');
        onRefresh();
      } catch {
        toast.error('Failed to save notes.');
      }
    });
  };

  const isNoteChanged = localNote.trim() !== savedNoteText.trim();

  return (
    <Card className="hover:border-primary/30 group/row relative overflow-hidden rounded-none border border-zinc-200 bg-zinc-50/10 transition-all dark:border-zinc-800 dark:bg-zinc-900/5">
      <div className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <pattern
            id={`cp-grid-${checkpoint.id}`}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#cp-grid-${checkpoint.id})`} />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-y-6 p-6">
        <div className="flex flex-col gap-4 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          {isEditing && !readOnly ? (
            <div className="flex flex-1 flex-col gap-4 sm:flex-row">
              <input
                type="text"
                aria-label="Checkpoint Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="focus:border-primary flex-1 rounded-none border border-zinc-200 bg-white p-2.5 text-xs font-bold uppercase outline-none dark:border-zinc-800 dark:bg-zinc-950"
              />
              <input
                type="date"
                aria-label="Checkpoint Due Date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="focus:border-primary rounded-none border border-zinc-200 bg-white p-2.5 font-mono text-xs font-bold uppercase outline-none dark:border-zinc-800 dark:bg-zinc-950"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 cursor-pointer rounded-none text-[10px] font-black uppercase"
                >
                  {isUpdating ? <Loader2 className="size-3 animate-spin" /> : 'Save'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(checkpoint.title);
                    setEditDueDate(checkpoint.dueDate ? formatIsoDate(checkpoint.dueDate) : '');
                  }}
                  variant="outline"
                  className="h-10 cursor-pointer rounded-none text-[10px] font-black uppercase"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-between">
              <div className="flex flex-col gap-y-1">
                <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                  Checkpoint Date
                </span>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-zinc-800 uppercase dark:text-zinc-200">
                    {checkpoint.title}
                  </h4>
                  <Badge
                    suppressHydrationWarning
                    variant="outline"
                    className="rounded-none border-zinc-200 bg-zinc-50 py-0.5 font-mono text-[8px] tracking-wider uppercase dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {formatLocalDate(checkpoint.dueDate)}
                  </Badge>
                </div>
              </div>
              {!readOnly && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="h-8 cursor-pointer rounded-none text-[9px] font-black uppercase"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    variant="unstyled"
                    className="dark:text-rose-450 flex size-8 cursor-pointer items-center justify-center rounded-none p-0 text-rose-500/70 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
                  >
                    {isDeleting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`note-textarea-${checkpoint.id}`}
              className="text-[9px] font-black tracking-widest text-zinc-400 uppercase"
            >
              Meeting Notes & Remarks
            </label>
            {!readOnly && (
              <Button
                onClick={handleSaveNote}
                disabled={isSavingNote || !isNoteChanged}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-8 cursor-pointer items-center justify-center gap-1 rounded-none text-[9px] font-black tracking-wider uppercase shadow-[2px_2px_0px_0px_rgba(var(--primary-rgb),0.2)] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                {isSavingNote ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Save className="size-3" />
                )}
                Save Notes
              </Button>
            )}
          </div>
          <Textarea
            id={`note-textarea-${checkpoint.id}`}
            rows={3}
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            disabled={readOnly}
            className="focus-visible:ring-primary resize-y rounded-none border border-zinc-200 bg-white p-3 font-mono text-xs leading-relaxed font-medium text-zinc-700 disabled:cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
          />
        </div>
      </div>
    </Card>
  );
}
