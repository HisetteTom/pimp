"use client";

import { useState, useMemo, useSyncExternalStore, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User as UserIcon, AlertTriangle, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface ReadOnlyTaskListViewProps {
  initialTasks: Task[];
  members: any[];
}

const STATUS_TITLES = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
} as Record<string, string>;

export function ReadOnlyTaskListView({ initialTasks, members }: ReadOnlyTaskListViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const selectedTaskAssignees = useMemo(() => {
    if (!selectedTask) return [];
    const ids = selectedTask.assignees?.split(",").filter(Boolean) || (selectedTask.assigneeId ? [selectedTask.assigneeId] : []);
    return members.filter(m => ids.includes(m.id));
  }, [selectedTask, members]);

  function handleSelectTask(task: Task) {
    setSelectedTask(task);
    setDetailOpen(true);
  }

  const priorityStyles = {
    low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-500/20",
    high: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-500/20",
  } as Record<string, string>;

  return (
    <>
      <div className="flex flex-col gap-y-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
            Task List
          </h3>
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
                {initialTasks.length > 0 ? (
                  initialTasks.map((task) => {
                    const assigneeIds = task.assignees ? task.assignees.split(",").filter(Boolean) : (task.assigneeId ? [task.assigneeId] : []);
                    const assignedMembers = members.filter(m => assigneeIds.includes(m.id));

                    return (
                      <tr 
                        key={task.id} 
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors group cursor-pointer"
                        onClick={() => handleSelectTask(task)}
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

                        {/* Status (Read-Only) */}
                        <td className="p-4 align-middle">
                          <Badge className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-bold uppercase text-[9px] rounded-none px-2 py-0.5 shadow-none">
                            {STATUS_TITLES[task.status] || task.status.replace("_", " ")}
                          </Badge>
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
                          <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-zinc-450 group-hover:text-primary transition-colors">
                            Details
                            <ChevronRight className="size-3.5 ml-1" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-zinc-400 font-medium italic">
                      No tasks created by team yet.
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
        <DialogContent className="sm:max-w-[450px] border border-zinc-200 dark:border-zinc-800 rounded-none bg-white dark:bg-zinc-950 shadow-2xl overflow-y-auto max-h-[90vh]">
          {selectedTask && (
            <div className="space-y-6">
              <DialogHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold uppercase text-[9px] rounded-none px-2 py-0.5 border border-zinc-200 dark:border-zinc-700">
                    {STATUS_TITLES[selectedTask.status] || selectedTask.status.replace("_", " ")}
                  </Badge>
                  <Badge className={`font-bold uppercase text-[9px] rounded-none px-2 py-0.5 ${
                    selectedTask.priority === "high"
                      ? "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-500/20"
                      : selectedTask.priority === "medium"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-500/20"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {selectedTask.priority} priority
                  </Badge>
                </div>
                <DialogTitle className="uppercase tracking-tight text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {selectedTask.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    Description
                  </span>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedTask.description || "No description provided for this task."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Deadline
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300">
                      <Calendar className="size-4 text-primary" />
                      {selectedTask.deadline ? (
                        <ClientDate date={selectedTask.deadline} />
                      ) : (
                        "None"
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    Assigned Team Members
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTaskAssignees.length === 0 ? (
                      <p className="text-xs text-zinc-400 font-semibold uppercase italic">
                        Unassigned
                      </p>
                    ) : (
                      selectedTaskAssignees.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/10 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 rounded-none uppercase"
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
