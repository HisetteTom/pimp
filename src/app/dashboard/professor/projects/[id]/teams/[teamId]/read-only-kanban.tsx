'use client';

import { useState, useSyncExternalStore } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User as UserIcon, ChevronRight, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';

interface Task {
  id: number;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: Date | string | null;
  assigneeId: string | null;
  assignees?: string | null;
}

interface ReadOnlyKanbanProps {
  initialTasks: Task[];
  members: { id: string; name: string }[];
}

const COLUMNS = [
  { id: 'todo', titleKey: 'colTodo' },
  { id: 'in_progress', titleKey: 'colInProgress' },
  { id: 'done', titleKey: 'colDone' },
];

export function ReadOnlyKanban({ initialTasks, members }: ReadOnlyKanbanProps) {
  const t = useTranslations('ProfessorReadOnlyKanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const tasksByStatus = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = initialTasks.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  const selectedTaskAssignees = (() => {
    if (!selectedTask) return [];
    const ids =
      selectedTask.assignees?.split(',').filter(Boolean) ||
      (selectedTask.assigneeId ? [selectedTask.assigneeId] : []);
    return members.filter((m) => ids.includes(m.id));
  })();

  function handleSelectTask(task: Task) {
    setSelectedTask(task);
    setDetailOpen(true);
  }

  const priorityLabels: Record<string, string> = {
    high: t('priorityHigh'),
    medium: t('priorityMedium'),
    low: t('priorityLow'),
  };

  const statusLabels: Record<string, string> = {
    todo: t('colTodo'),
    in_progress: t('colInProgress'),
    done: t('colDone'),
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={t(column.titleKey)}
            tasks={tasksByStatus[column.id]}
            members={members}
            onSelect={handleSelectTask}
            emptyText={t('noTasks')}
            inspectText={t('inspect')}
            unassignedText={t('unassigned')}
            overdueText={t('overdue')}
          />
        ))}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none border border-zinc-200 bg-white shadow-2xl sm:max-w-[450px] dark:border-zinc-800 dark:bg-zinc-950">
          {selectedTask && (
            <div className="space-y-6">
              <DialogHeader className="relative z-10 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="mb-1.5 flex items-center gap-2">
                  <Badge className="rounded-none border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-800 uppercase dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {statusLabels[selectedTask.status] || selectedTask.status.replace('_', ' ')}
                  </Badge>
                  <Badge
                    className={`rounded-none px-2 py-0.5 text-[9px] font-bold uppercase ${
                      selectedTask.priority === 'high'
                        ? 'border border-red-500/20 bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                        : selectedTask.priority === 'medium'
                          ? 'border border-amber-500/20 bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'border border-emerald-500/20 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                    }`}
                  >
                    {priorityLabels[selectedTask.priority] || selectedTask.priority}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
                  {selectedTask.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                    {t('description')}
                  </span>
                  <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                    {selectedTask.description || t('noDescription')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                      {t('deadline')}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase dark:text-zinc-300">
                      <Calendar className="text-primary size-4" />
                      {selectedTask.deadline ? (
                        <ClientDate date={selectedTask.deadline} />
                      ) : (
                        t('none')
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                    {t('assignedMembers')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTaskAssignees.length === 0 ? (
                      <p className="text-xs font-semibold text-zinc-400 uppercase italic">
                        {t('unassigned')}
                      </p>
                    ) : (
                      selectedTaskAssignees.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-1.5 rounded-none border border-zinc-300 bg-zinc-50/50 px-2.5 py-1 text-[10px] font-semibold text-zinc-700 uppercase dark:border-zinc-700 dark:bg-zinc-900/10 dark:text-zinc-300"
                        >
                          <UserIcon className="size-3 text-zinc-400" />
                          <span>{member.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function KanbanColumn({
  title,
  tasks,
  members,
  onSelect,
  emptyText,
  inspectText,
  unassignedText,
  overdueText,
}: {
  id: string;
  title: string;
  tasks: Task[];
  members: { id: string; name: string }[];
  onSelect: (task: Task) => void;
  emptyText: string;
  inspectText: string;
  unassignedText: string;
  overdueText: string;
}) {
  return (
    <div className="flex flex-col gap-y-4 rounded-none border border-zinc-200 bg-zinc-50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
          {title}
          <span className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-zinc-500 dark:bg-zinc-800">
            {tasks.length}
          </span>
        </h4>
      </div>
      <div className="flex min-h-[400px] flex-col gap-y-4">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            members={members}
            onClick={() => onSelect(task)}
            inspectText={inspectText}
            unassignedText={unassignedText}
            overdueText={overdueText}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-none border-2 border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase italic">{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const priorityStyles = {
  low: 'border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/10 dark:bg-emerald-950/5 shadow-[0_2px_8px_-3px_rgba(16,185,129,0.15)] hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)]',
  medium:
    'border-amber-300/80 dark:border-amber-800/60 bg-amber-50/10 dark:bg-amber-950/5 shadow-[0_2px_8px_-3px_rgba(245,158,11,0.15)] hover:border-amber-500 dark:hover:border-amber-600 hover:shadow-[0_4px_16px_rgba(245,158,11,0.25)]',
  high: 'border-red-300/80 dark:border-red-800/60 bg-red-50/10 dark:bg-red-950/5 shadow-[0_2px_8px_-3px_rgba(239,68,68,0.15)] hover:border-red-500 dark:hover:border-red-600 hover:shadow-[0_4px_16px_rgba(239,68,68,0.25)]',
} as Record<string, string>;

function KanbanCard({
  task,
  members,
  onClick,
  inspectText,
  unassignedText,
  overdueText,
}: {
  task: Task;
  members: { id: string; name: string }[];
  onClick: () => void;
  inspectText: string;
  unassignedText: string;
  overdueText: string;
}) {
  const assigneeIds = task.assignees
    ? task.assignees.split(',').filter(Boolean)
    : task.assigneeId
      ? [task.assigneeId]
      : [];
  const assignedMembers = members.filter((m) => assigneeIds.includes(m.id));

  const currentStyle = priorityStyles[task.priority] || priorityStyles.medium;

  const isOverdue = (() => {
    if (!task.deadline || task.status === 'done') return false;
    return new Date(task.deadline) < new Date();
  })();

  return (
    <Card
      onClick={onClick}
      role="button"
      className={`cursor-pointer rounded-none border-2 p-4 shadow-none transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] ${currentStyle}`}
    >
      <div className="flex flex-col gap-y-3">
        <div className="flex w-full items-center justify-between">
          {isOverdue && (
            <span className="flex animate-pulse items-center gap-1 rounded-none border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-extrabold text-red-500 uppercase dark:border-red-800 dark:bg-red-950/20">
              <AlertTriangle className="size-3" />
              {overdueText}
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
          <h5 className="text-xs font-semibold tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
            {task.name}
          </h5>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800">
          <span className="flex items-center gap-0.5 text-[9px] font-black text-zinc-400 uppercase">
            {inspectText} <ChevronRight className="size-3" />
          </span>
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
            <span className="text-[9px] font-bold text-zinc-300 uppercase italic">
              {unassignedText}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
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
