'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, User as UserIcon, Clock } from 'lucide-react';
import { CalendarEventProps } from './types';

interface DetailsDialogProps {
  selectedEvent: CalendarEventProps | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  members: { id: string; name: string }[];
}

export function DetailsDialog({
  selectedEvent,
  isOpen,
  onOpenChange,
  members,
}: DetailsDialogProps) {
  const selectedTaskAssignees = (() => {
    if (!selectedEvent || selectedEvent.type !== 'task' || !selectedEvent.task) return [];
    const taskObj = selectedEvent.task;
    const ids =
      taskObj.assignees?.split(',').filter(Boolean) ||
      (taskObj.assigneeId ? [taskObj.assigneeId] : []);
    return members.filter((m) => ids.includes(m.id));
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none border-2 border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {selectedEvent && (
          <div className="space-y-6 p-2">
            <DialogHeader className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
              {selectedEvent.type !== 'boundary' && selectedEvent.type !== 'checkpoint' && (
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="rounded-none border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[9px] font-bold tracking-wider text-zinc-600 uppercase dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    {selectedEvent.type}
                  </Badge>
                </div>
              )}
              <DialogTitle className="text-xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
                {selectedEvent.title.replace(/^[^\s]+\s+/, '')}
              </DialogTitle>
            </DialogHeader>

            {/* BOUNDARY INFO */}
            {selectedEvent.type === 'boundary' && (
              <div className="space-y-4">
                <p className="font-mono text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {selectedEvent.description}
                </p>
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  <CalendarIcon className="size-3.5" />
                  Date:{' '}
                  {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : ''}
                </div>
              </div>
            )}

            {/* CHECKPOINT INFO */}
            {selectedEvent.type === 'checkpoint' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  <CalendarIcon className="size-3.5" />
                  Due Date:{' '}
                  {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : ''}
                </div>
                <div className="space-y-2">
                  <span className="font-mono text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                    Supervisor Meeting Notes
                  </span>
                  {selectedEvent.notes ? (
                    <div className="border-primary border-l-2 bg-zinc-50/50 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-700 dark:bg-zinc-900/10 dark:text-zinc-300">
                      {selectedEvent.notes}
                    </div>
                  ) : (
                    <p className="font-mono text-xs font-bold text-zinc-400 uppercase italic">
                      No supervisor notes recorded for this checkpoint yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* READ-ONLY TASK FALLBACK */}
            {selectedEvent.type === 'task' && selectedEvent.task && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <Badge className="rounded-none border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-800 uppercase dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {selectedEvent.task.status.replace('_', ' ')}
                  </Badge>
                  <Badge
                    className={`rounded-none px-2 py-0.5 text-[9px] font-bold uppercase ${
                      selectedEvent.task.priority === 'high'
                        ? 'border border-red-500/20 bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                        : selectedEvent.task.priority === 'medium'
                          ? 'border border-amber-500/20 bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'border border-emerald-500/20 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                    }`}
                  >
                    {selectedEvent.task.priority} priority
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="font-mono text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                    Description
                  </span>
                  <p className="font-mono text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {selectedEvent.task.description || 'No description provided.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                      Start (In Progress)
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                      <Clock className="size-3" />
                      {selectedEvent.task.inProgressAt
                        ? new Date(selectedEvent.task.inProgressAt).toLocaleDateString()
                        : 'Not started'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                      Completed
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                      <Clock className="size-3" />
                      {selectedEvent.task.completedAt
                        ? new Date(selectedEvent.task.completedAt).toLocaleDateString()
                        : 'Not completed'}
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <span className="font-mono text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                    Deadline
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                    <CalendarIcon className="size-3" />
                    {selectedEvent.task.deadline
                      ? new Date(selectedEvent.task.deadline).toLocaleDateString()
                      : 'No deadline'}
                  </div>
                </div>

                {selectedTaskAssignees.length > 0 && (
                  <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <span className="font-mono text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                      Assignees
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedTaskAssignees.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-1 border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[9px] font-bold text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                        >
                          <UserIcon className="size-3" />
                          {m.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
