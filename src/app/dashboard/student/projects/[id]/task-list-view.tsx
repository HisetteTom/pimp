'use client';

import { useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateTaskStatus } from '../../actions';
import { toast } from 'sonner';
import { Calendar, Plus, AlertTriangle, ChevronRight } from 'lucide-react';
import { TaskDialog } from './task-dialog';
import { TaskDetailDialog } from './task-detail-dialog';
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

interface TaskListViewProps {
  initialTasks: Task[];
  projectId: number;
  members: { id: string; name: string }[];
  teamId: number;
}

const priorityStyles = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20',
  medium:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-500/20',
  high: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-500/20',
} as Record<string, string>;

/**
 * Renders a list layout of student tasks in a tabular spreadsheet format.
 * Provides controls for modifying status dropdowns directly, formats priority weight tags,
 * alerts students of overdue deadlines, and integrates details/creation dialogs.
 */
export function TaskListView({ initialTasks, projectId, members, teamId }: TaskListViewProps) {
  const t = useTranslations('TaskListView');
  const [tasks, setTasks] = useState<Task[]>(() => initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const COLUMNS = [
    { id: 'todo', title: t('todo') },
    { id: 'in_progress', title: t('inProgress') },
    { id: 'done', title: t('done') },
  ];

  function handleSelectTask(task: Task) {
    setSelectedTask(task);
    setDetailOpen(true);
  }

  async function handleStatusChange(taskId: number, newStatus: string) {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      await updateTaskStatus(taskId, newStatus, projectId);
      toast.success('Task status updated');
    } catch {
      setTasks(previousTasks);
      toast.error(t('failedUpdate'));
    }
  }

  return (
    <>
      <div className="flex flex-col gap-y-4">
        {/* Top actions */}
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
            {t('taskList')}
          </h3>
          <TaskDialog
            projectId={projectId}
            teamId={teamId}
            members={members}
            defaultStatus="todo"
            trigger={
              <Button className="text-xs font-semibold tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)]">
                <Plus className="mr-2 size-4" />
                {t('addTask')}
              </Button>
            }
          />
        </div>

        {/* Responsive Table */}
        <div className="overflow-hidden border-2 border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b-2 border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('taskName')}
                  </th>
                  <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('status')}
                  </th>
                  <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('priority')}
                  </th>
                  <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('deadline')}
                  </th>
                  <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('assignees')}
                  </th>
                  <th className="p-4 text-right text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {tasks.length > 0 ? (
                  tasks.map((task) => {
                    const assigneeIds = task.assignees
                      ? task.assignees.split(',').filter(Boolean)
                      : task.assigneeId
                        ? [task.assigneeId]
                        : [];
                    const assignedMembers = members.filter((m) => assigneeIds.includes(m.id));

                    return (
                      <tr
                        key={task.id}
                        className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10"
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

                        {/* Status Dropdown */}
                        <td className="p-4 align-middle">
                          <div
                            className="w-[140px]"
                            onClick={(e) => e.stopPropagation()}
                            role="presentation"
                          >
                            <Select
                              value={task.status}
                              onValueChange={(val) => handleStatusChange(task.id, val)}
                            >
                              <SelectTrigger className="h-8 rounded-none text-xs font-semibold tracking-wider uppercase">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-none">
                                {COLUMNS.map((col) => (
                                  <SelectItem
                                    key={col.id}
                                    value={col.id}
                                    className="text-xs font-semibold tracking-wider uppercase"
                                  >
                                    {col.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>

                        {/* Priority Badge */}
                        <td className="p-4 align-middle">
                          <Badge
                            className={`rounded-none px-2 py-0.5 text-[9px] font-bold uppercase shadow-none ${priorityStyles[task.priority] || priorityStyles.medium}`}
                          >
                            {task.priority === 'low'
                              ? t('low')
                              : task.priority === 'high'
                                ? t('high')
                                : t('medium')}
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
                            <OverdueBadge deadline={task.deadline} status={task.status} />
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectTask(task)}
                            className="hover:text-primary h-8 rounded-none text-xs font-semibold tracking-wider text-zinc-400 uppercase"
                          >
                            {t('details')}
                            <ChevronRight className="ml-1 size-3.5" />
                          </Button>
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

      <TaskDetailDialog
        key={selectedTask?.id ?? 'none'}
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        members={members}
        projectId={projectId}
      />
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

function OverdueBadge({ deadline, status }: { deadline: Date | string | null; status: string }) {
  const t = useTranslations('TaskListView');
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
      {t('overdue')}
    </span>
  );
}
