"use client";

import { useState, useMemo, useSyncExternalStore, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTaskStatus } from "../../actions";
import { toast } from "sonner";
import { Calendar, User as UserIcon, Plus, AlertTriangle, ChevronRight } from "lucide-react";
import { TaskDialog } from "./task-dialog";
import { TaskDetailDialog } from "./task-detail-dialog";

interface Task {
  id: number;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  assigneeId: string | null;
  assignees?: string | null;
}

interface TaskListViewProps {
  initialTasks: Task[];
  projectId: number;
  members: any[];
  teamId: number;
}

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export function TaskListView({ initialTasks, projectId, members, teamId }: TaskListViewProps) {
  const [tasks, setTasks] = useState<Task[]>(() => initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function handleSelectTask(task: Task) {
    setSelectedTask(task);
    setDetailOpen(true);
  }

  async function handleStatusChange(taskId: number, newStatus: string) {
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus(taskId, newStatus, projectId);
      toast.success("Task status updated");
    } catch (error) {
      setTasks(previousTasks);
      toast.error("Failed to update task status");
    }
  }

  const priorityStyles = {
    low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-500/20",
    high: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-500/20",
  } as Record<string, string>;

  return (
    <>
      <div className="flex flex-col gap-y-4">
        {/* Top actions */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
            Task List
          </h3>
          <TaskDialog 
            projectId={projectId} 
            teamId={teamId} 
            members={members} 
            defaultStatus="todo"
            trigger={
              <Button className="font-semibold uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)]">
                <Plus className="size-4 mr-2" />
                Add Task
              </Button>
            }
          />
        </div>

        {/* Responsive Table */}
        <div className="border-2 border-zinc-100 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b-2 border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="p-4 font-semibold uppercase text-[10px] tracking-widest text-zinc-400">Task Name</th>
                  <th className="p-4 font-semibold uppercase text-[10px] tracking-widest text-zinc-400">Status</th>
                  <th className="p-4 font-semibold uppercase text-[10px] tracking-widest text-zinc-400">Priority</th>
                  <th className="p-4 font-semibold uppercase text-[10px] tracking-widest text-zinc-400">Deadline</th>
                  <th className="p-4 font-semibold uppercase text-[10px] tracking-widest text-zinc-400">Assignees</th>
                  <th className="p-4 font-semibold uppercase text-[10px] tracking-widest text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {tasks.length > 0 ? (
                  tasks.map((task) => {
                    const assigneeIds = task.assignees ? task.assignees.split(",").filter(Boolean) : (task.assigneeId ? [task.assigneeId] : []);
                    const assignedMembers = members.filter(m => assigneeIds.includes(m.id));

                    return (
                      <tr 
                        key={task.id} 
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors group"
                      >
                        {/* Name & Description */}
                        <td className="p-4 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold uppercase text-zinc-900 dark:text-zinc-100 text-xs tracking-tight">
                              {task.name}
                            </span>
                            {task.description && (
                              <span className="text-[10px] text-zinc-400 line-clamp-1 max-w-[250px]">
                                {task.description}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="p-4 align-middle">
                          <div className="w-[140px]" onClick={(e) => e.stopPropagation()} role="presentation">
                            <Select
                              value={task.status}
                              onValueChange={(val) => handleStatusChange(task.id, val)}
                            >
                              <SelectTrigger className="h-8 text-xs font-semibold uppercase tracking-wider rounded-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-none">
                                {COLUMNS.map((col) => (
                                  <SelectItem key={col.id} value={col.id} className="text-xs font-semibold uppercase tracking-wider">
                                    {col.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>

                        {/* Priority Badge */}
                        <td className="p-4 align-middle">
                          <Badge className={`font-bold uppercase text-[9px] rounded-none px-2 py-0.5 shadow-none ${priorityStyles[task.priority] || priorityStyles.medium}`}>
                            {task.priority}
                          </Badge>
                        </td>

                        {/* Deadline & Overdue Warning */}
                        <td className="p-4 align-middle">
                          <div className="flex flex-col gap-1" suppressHydrationWarning>
                            {task.deadline ? (
                              <div className="flex items-center gap-1.5 text-xs font-semibold font-mono tracking-tight text-zinc-700 dark:text-zinc-300">
                                <Calendar className="size-3.5 text-zinc-400" />
                                <ClientDate date={task.deadline} />
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-zinc-300 uppercase italic">None</span>
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
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2);

                                return (
                                  <div
                                    key={member.id}
                                    title={member.name}
                                    className="inline-flex size-6 items-center justify-center rounded-full bg-purple-600 dark:bg-purple-700 text-[9px] font-bold text-white ring-2 ring-white dark:ring-zinc-950 transition-all hover:scale-110 select-none -mr-1.5 last:mr-0"
                                  >
                                    {initials}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-300 uppercase italic">Unassigned</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 align-middle text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSelectTask(task)}
                            className="h-8 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-primary rounded-none"
                          >
                            Details
                            <ChevronRight className="size-3.5 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-zinc-400 font-medium italic">
                      No tasks created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TaskDetailDialog 
        key={selectedTask?.id ?? "none"}
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
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  return <span suppressHydrationWarning>{isClient ? new Date(date).toLocaleDateString() : "..."}</span>;
}

function OverdueBadge({ deadline, status }: { deadline: string | null; status: string }) {
  const now = useSyncExternalStore(timeStore.subscribe, timeStore.getSnapshot, timeStore.getServerSnapshot);

  if (!deadline || status === "done") return null;

  const isOverdue = now > 0 && new Date(deadline).getTime() < now;

  if (!isOverdue) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[9px] text-red-500 font-extrabold uppercase bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-1.5 py-0.5 rounded-none w-fit animate-pulse" suppressHydrationWarning>
      <AlertTriangle className="size-3" />
      Overdue
    </span>
  );
}
