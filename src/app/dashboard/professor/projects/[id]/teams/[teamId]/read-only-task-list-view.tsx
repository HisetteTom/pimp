'use client';

import { useState, useSyncExternalStore } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, User as UserIcon, AlertTriangle, ChevronRight } from 'lucide-react';
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

interface ReadOnlyTaskListViewProps {
  initialTasks: Task[];
  members: { id: string; name: string }[];
}

const priorityStyles = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20',
  medium:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-500/20',
  high: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-450 border border-red-500/20',
} as Record<string, string>;

export function ReadOnlyTaskListView({ initialTasks, members }: ReadOnlyTaskListViewProps) {
  const t = useTranslations('ProfessorReadOnlyTaskList');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const STATUS_TITLES = {
    todo: t('colTodo'),
    in_progress: t('colInProgress'),
    done: t('colDone'),
  } as Record<string, string>;

  const priorityLabels = {
    low: t('priorityLow'),
    medium: t('priorityMedium'),
    high: t('priorityHigh'),
  } as Record<string, string>;

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

  return (
    <>
      <div className="flex flex-col gap-y-4">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
            {t('title')}
          </h3>
        </div>

        {/* Responsive Table */}
        <div className="overflow-hidden border-2 border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b-2 border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('colTaskName')}
                  </th>
                  <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('colStatus')}
                  </th>
                  <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('colPriority')}
                  </th>
                  <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('colDeadline')}
                  </th>
                  <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('colAssignees')}
                  </th>
                  <th className="p-4 text-right text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('colActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {initialTasks.length > 0 ? (
                  initialTasks.map((task) => {
                    const assigneeIds = task.assignees
                      ? task.assignees.split(',').filter(Boolean)
                      : task.assigneeId
                        ? [task.assigneeId]
                        : [];
                    const assignedMembers = members.filter((m) => assigneeIds.includes(m.id));

                    return (
                      <tr
                        key={task.id}
                        className="group cursor-pointer transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10"
                        onClick={() => handleSelectTask(task)}
                      >
                        {/* Name & Description */}
                        <td className="p-4 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
                              {task.name}
                            </span>
                            {task.description && (
                              <span className="line-clamp-1 max-w-[250px] text-[10px] text-zinc-400">
                                {task.description}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status (Read-Only) */}
                        <td className="p-4 align-middle">
                          <Badge className="rounded-none border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-800 uppercase shadow-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                            {STATUS_TITLES[task.status] || task.status.replace('_', ' ')}
                          </Badge>
                        </td>

                        {/* Priority Badge */}
                        <td className="p-4 align-middle">
                          <Badge
                            className={`rounded-none px-2 py-0.5 text-[9px] font-bold uppercase shadow-none ${priorityStyles[task.priority] || priorityStyles.medium}`}
                          >
                            {priorityLabels[task.priority] || task.priority}
                          </Badge>
                        </td>

                        {/* Deadline & Overdue Warning */}
                        <td className="p-4 align-middle">
                          <div className="flex flex-col gap-1" suppressHydrationWarning>
                            {task.deadline ? (
                              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold tracking-tight text-zinc-700 dark:text-zinc-300">
                                <Calendar className="size-3.5 text-zinc-400" />
                                <ClientDate date={task.deadline} />
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-zinc-300 uppercase italic">
                                {t('none')}
                              </span>
                            )}
                            <OverdueBadge
                              deadline={task.deadline}
                              status={task.status}
                              overdueText={t('overdue')}
                            />
                          </div>
                        </td>

                        {/* Assignee Avatars */}
                        <td className="p-4 align-middle">
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
                                    className="-mr-1.5 inline-flex size-6 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white ring-2 ring-white transition-all select-none last:mr-0 hover:scale-110 dark:bg-purple-700 dark:ring-zinc-950"
                                  >
                                    {initials}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-300 uppercase italic">
                              {t('unassigned')}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right align-middle">
                          <span className="text-zinc-450 group-hover:text-primary inline-flex items-center text-xs font-semibold tracking-wider uppercase transition-colors">
                            {t('details')}
                            <ChevronRight className="ml-1 size-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center font-medium text-zinc-400 italic">
                      {t('noTasks')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none border border-zinc-200 bg-white shadow-2xl sm:max-w-[450px] dark:border-zinc-800 dark:bg-zinc-950">
          {selectedTask && (
            <div className="space-y-6">
              <DialogHeader className="relative z-10 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="mb-1.5 flex items-center gap-2">
                  <Badge className="rounded-none border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-800 uppercase dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {STATUS_TITLES[selectedTask.status] || selectedTask.status.replace('_', ' ')}
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
                      {t('colDeadline')}
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

const emptySubscribe = () => () => {};

const timeStore = {
  subscribe: () => () => {},
  getSnapshot: () => Date.now(),
  getServerSnapshot: () => 0,
};

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

function OverdueBadge({
  deadline,
  status,
  overdueText,
}: {
  deadline: Date | string | null;
  status: string;
  overdueText: string;
}) {
  const now = useSyncExternalStore(
    timeStore.subscribe,
    timeStore.getSnapshot,
    timeStore.getServerSnapshot,
  );

  if (!deadline || status === 'done') return null;

  const isOverdue = now > 0 && new Date(deadline).getTime() < now;

  if (!isOverdue) return null;

  return (
    <span
      className="inline-flex w-fit animate-pulse items-center gap-1 rounded-none border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-extrabold text-red-500 uppercase dark:border-red-800 dark:bg-red-950/20"
      suppressHydrationWarning
    >
      <AlertTriangle className="size-3" />
      {overdueText}
    </span>
  );
}
