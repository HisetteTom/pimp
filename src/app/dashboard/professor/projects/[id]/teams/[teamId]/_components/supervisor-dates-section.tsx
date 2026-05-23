'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createCheckpoint } from '../../../../../actions';
import { CheckpointRow } from './checkpoint-row';

export interface SupervisorDatesSectionProps {
  projectId: number;
  teamId: number;
  checkpoints: {
    id: number;
    title: string;
    description?: string | null;
    dueDate: Date;
    projectId: number;
  }[];
  checkpointNotes: { id: number; checkpointId: number; teamId: number; notes: string | null }[];
  readOnly?: boolean;
}

export function SupervisorDatesSection({
  projectId,
  teamId,
  checkpoints,
  checkpointNotes,
  readOnly = false,
}: SupervisorDatesSectionProps) {
  const { refresh } = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isCreating, startCreateTransition] = useTransition();

  const handleAddCheckpoint = () => {
    if (readOnly || !newTitle.trim() || !newDueDate) return;
    startCreateTransition(async () => {
      try {
        await createCheckpoint(projectId, newTitle.trim(), newDueDate);
        toast.success('Checkpoint created successfully!');
        setNewTitle('');
        setNewDueDate('');
        setIsAdding(false);
        refresh();
      } catch {
        toast.error('Failed to create checkpoint.');
      }
    });
  };

  return (
    <Card className="group hover:border-primary/50 relative flex flex-col overflow-hidden rounded-none border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.1]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dates-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dates-grid)" />
        </svg>
      </div>

      <CardHeader className="relative z-10 flex flex-col gap-4 border-b border-zinc-100 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <CardTitle className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
            Project Checkpoints & Meeting Notes
          </CardTitle>
        </div>
        {!isAdding && !readOnly && (
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-none text-xs font-black tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Plus className="size-3.5" />
            Add Checkpoint
          </Button>
        )}
      </CardHeader>

      <CardContent className="relative z-10 flex flex-col gap-y-6 p-6 pt-4">
        {isAdding && !readOnly && (
          <div className="flex flex-col items-stretch gap-4 border border-dashed border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/5">
            <h5 className="dark:text-zinc-150 text-[10px] font-semibold tracking-wider text-zinc-900 uppercase">
              Create New Project-wide Checkpoint
            </h5>
            <div className="flex flex-col items-end gap-4 sm:flex-row">
              <div className="flex flex-1 flex-col gap-1">
                <label
                  htmlFor="new-title"
                  className="text-[8px] font-bold tracking-wider text-zinc-400 uppercase"
                >
                  Title
                </label>
                <input
                  id="new-title"
                  type="text"
                  aria-label="New Checkpoint Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="focus:border-primary w-full rounded-none border border-zinc-200 bg-white p-2.5 text-xs font-bold uppercase outline-none dark:border-zinc-800 dark:bg-zinc-950"
                />
              </div>
              <div className="flex w-full flex-1 flex-col gap-1 sm:w-auto">
                <label
                  htmlFor="new-due-date"
                  className="text-[8px] font-bold tracking-wider text-zinc-400 uppercase"
                >
                  Due Date
                </label>
                <input
                  id="new-due-date"
                  type="date"
                  aria-label="New Checkpoint Due Date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="focus:border-primary w-full rounded-none border border-zinc-200 bg-white p-2.5 font-mono text-xs font-bold uppercase outline-none dark:border-zinc-800 dark:bg-zinc-950"
                />
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button
                  onClick={handleAddCheckpoint}
                  disabled={isCreating || !newTitle.trim() || !newDueDate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 flex-1 cursor-pointer rounded-none text-[10px] font-black uppercase sm:flex-initial"
                >
                  {isCreating ? <Loader2 className="size-3.5 animate-spin" /> : 'Create'}
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false);
                    setNewTitle('');
                    setNewDueDate('');
                  }}
                  variant="outline"
                  className="h-10 flex-1 cursor-pointer rounded-none text-[10px] font-black uppercase sm:flex-initial"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-y-6">
          {checkpoints.length === 0 ? (
            <p className="py-8 text-center text-xs font-bold text-zinc-400 uppercase italic">
              No checkpoints created for this project yet. Add one above!
            </p>
          ) : (
            checkpoints.map((cp) => {
              const note = checkpointNotes.find((n) => n.checkpointId === cp.id);
              return (
                <CheckpointRow
                  key={cp.id}
                  checkpoint={cp}
                  teamId={teamId}
                  projectId={projectId}
                  savedNoteText={note?.notes || ''}
                  onRefresh={refresh}
                  readOnly={readOnly}
                />
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
