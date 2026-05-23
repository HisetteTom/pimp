'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, AlertTriangle } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface Task {
  id: number;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: Date | string | null;
  assigneeId: string | null;
  assignees?: string | null;
}

const emptySubscribe = () => () => {};

function ClientDate({ date }: { date: string | Date }) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  return (
    <span suppressHydrationWarning>{isClient ? new Date(date).toLocaleDateString() : '...'}</span>
  );
}

export function KanbanCard({
  task,
  isOverlay,
  members,
}: {
  task: Task;
  isOverlay?: boolean;
  members: { id: string; name: string }[];
}) {
  const assigneeIds = task.assignees
    ? task.assignees.split(',').filter(Boolean)
    : task.assigneeId
      ? [task.assigneeId]
      : [];
  const assignedMembers = members.filter((m) => assigneeIds.includes(m.id));

  const priorityStyles = {
    low: 'border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/10 dark:bg-emerald-950/5 shadow-[0_2px_8px_-3px_rgba(16,185,129,0.15)] hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)]',
    medium:
      'border-amber-300/80 dark:border-amber-800/60 bg-amber-50/10 dark:bg-amber-950/5 shadow-[0_2px_8px_-3px_rgba(245,158,11,0.15)] hover:border-amber-500 dark:hover:border-amber-600 hover:shadow-[0_4px_16px_rgba(245,158,11,0.25)]',
    high: 'border-red-300/80 dark:border-red-800/60 bg-red-50/10 dark:bg-red-950/5 shadow-[0_2px_8px_-3px_rgba(239,68,68,0.15)] hover:border-red-500 dark:hover:border-red-600 hover:shadow-[0_4px_16px_rgba(239,68,68,0.25)]',
  } as Record<string, string>;

  const currentStyle = priorityStyles[task.priority] || priorityStyles.medium;

  const isOverdue = useMemo(() => {
    if (!task.deadline || task.status === 'done') return false;
    return new Date(task.deadline) < new Date();
  }, [task.deadline, task.status]);

  return (
    <Card
      className={`cursor-grab border-2 p-4 shadow-none transition-colors active:cursor-grabbing ${currentStyle} ${isOverlay ? 'border-primary scale-105 shadow-xl' : ''}`}
    >
      <div className="flex flex-col gap-y-3">
        <div className="flex w-full items-center justify-between">
          {isOverdue && (
            <span className="flex animate-pulse items-center gap-1 rounded-none border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-extrabold text-red-500 uppercase dark:border-red-800 dark:bg-red-950/20">
              <AlertTriangle className="size-3" />
              Overdue
            </span>
          )}
          {task.deadline && (
            <div className="ml-auto flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase">
              <Calendar className="size-3" />
              <ClientDate date={task.deadline} />
            </div>
          )}
        </div>

        <div>
          <h5 className="text-xs font-semibold tracking-tight uppercase">{task.name}</h5>
        </div>

        <div className="flex justify-end border-t border-zinc-100 pt-2 dark:border-zinc-800">
          {assignedMembers.length > 0 ? (
            <div className="flex items-center overflow-hidden">
              {assignedMembers.map((member) => {
                const initials = member.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={member.id}
                    title={member.name}
                    className="-mr-1.5 inline-flex size-5 items-center justify-center rounded-full bg-purple-600 text-[8px] font-bold text-white ring-2 ring-white transition-all select-none last:mr-0 hover:scale-110 dark:bg-purple-700 dark:ring-zinc-950"
                  >
                    {initials}
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="text-[9px] font-bold text-zinc-300 uppercase italic">Unassigned</span>
          )}
        </div>
      </div>
    </Card>
  );
}

export function SortableTaskCard({
  task,
  members,
  onSelect,
}: {
  task: Task;
  members: { id: string; name: string }[];
  onSelect: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        onSelect(task);
      }}
      className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left focus:outline-none"
    >
      <KanbanCard task={task} members={members} />
    </button>
  );
}
