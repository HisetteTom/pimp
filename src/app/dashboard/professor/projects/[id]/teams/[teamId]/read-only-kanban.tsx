"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User as UserIcon, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface ReadOnlyKanbanProps {
  initialTasks: Task[];
  members: any[];
}

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export function ReadOnlyKanban({ initialTasks, members }: ReadOnlyKanbanProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const tasksByStatus = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = initialTasks.filter((t) => t.status === col.id);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [initialTasks]);

  const selectedTaskAssignees = useMemo(() => {
    if (!selectedTask) return [];
    const ids = selectedTask.assignees?.split(",").filter(Boolean) || (selectedTask.assigneeId ? [selectedTask.assigneeId] : []);
    return members.filter(m => ids.includes(m.id));
  }, [selectedTask, members]);

  function handleSelectTask(task: Task) {
    setSelectedTask(task);
    setDetailOpen(true);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasksByStatus[column.id]}
            members={members}
            onSelect={handleSelectTask}
          />
        ))}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[450px] border border-zinc-200 dark:border-zinc-800 rounded-none bg-white dark:bg-zinc-950 shadow-2xl overflow-y-auto max-h-[90vh]">
          {selectedTask && (
            <div className="space-y-6">
              <DialogHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold uppercase text-[9px] rounded-none px-2 py-0.5 border border-zinc-200 dark:border-zinc-700">
                    {selectedTask.status.replace("_", " ")}
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

function KanbanColumn({
  id,
  title,
  tasks,
  members,
  onSelect,
}: {
  id: string;
  title: string;
  tasks: Task[];
  members: any[];
  onSelect: (task: Task) => void;
}) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-y-4 rounded-none shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold uppercase tracking-widest text-[10px] text-zinc-400 flex items-center gap-2">
          {title}
          <span className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-mono">
            {tasks.length}
          </span>
        </h4>
      </div>
      <div className="flex flex-col gap-y-4 min-h-[400px]">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} members={members} onClick={() => onSelect(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center rounded-none flex-1 flex items-center justify-center">
            <p className="text-[10px] text-zinc-400 font-semibold uppercase italic">No tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ task, members, onClick }: { task: Task; members: any[]; onClick: () => void }) {
  const assigneeIds = task.assignees
    ? task.assignees.split(",").filter(Boolean)
    : task.assigneeId
    ? [task.assigneeId]
    : [];
  const assignedMembers = members.filter((m) => assigneeIds.includes(m.id));

  const priorityStyles = {
    low: "border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/10 dark:bg-emerald-950/5 shadow-[0_2px_8px_-3px_rgba(16,185,129,0.15)] hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)]",
    medium: "border-amber-300/80 dark:border-amber-800/60 bg-amber-50/10 dark:bg-amber-950/5 shadow-[0_2px_8px_-3px_rgba(245,158,11,0.15)] hover:border-amber-500 dark:hover:border-amber-600 hover:shadow-[0_4px_16px_rgba(245,158,11,0.25)]",
    high: "border-red-300/80 dark:border-red-800/60 bg-red-50/10 dark:bg-red-950/5 shadow-[0_2px_8px_-3px_rgba(239,68,68,0.15)] hover:border-red-500 dark:hover:border-red-600 hover:shadow-[0_4px_16px_rgba(239,68,68,0.25)]",
  } as Record<string, string>;

  const currentStyle = priorityStyles[task.priority] || priorityStyles.medium;

  const isOverdue = useMemo(() => {
    if (!task.deadline || task.status === "done") return false;
    return new Date(task.deadline) < new Date();
  }, [task.deadline, task.status]);

  return (
    <Card
      onClick={onClick}
      role="button"
      className={`p-4 border-2 shadow-none rounded-none transition-all cursor-pointer hover:translate-y-[-1px] hover:translate-x-[-1px] ${currentStyle}`}
    >
      <div className="flex flex-col gap-y-3">
        <div className="flex justify-between items-center w-full">
          {isOverdue && (
            <span className="flex items-center gap-1 text-[9px] text-red-500 font-extrabold uppercase bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-1.5 py-0.5 rounded-none animate-pulse">
              <AlertTriangle className="size-3" />
              Overdue
            </span>
          )}
          {task.deadline && (
            <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-bold uppercase ml-auto">
              <Calendar className="size-3" />
              <ClientDate date={task.deadline} />
            </div>
          )}
        </div>

        <div>
          <h5 className="font-semibold uppercase text-xs tracking-tight text-zinc-900 dark:text-zinc-100">
            {task.name}
          </h5>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-[9px] font-black uppercase text-zinc-400 flex items-center gap-0.5">
            Inspect <ChevronRight className="size-3" />
          </span>
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
                    className="inline-flex size-5 items-center justify-center rounded-full bg-purple-600 dark:bg-purple-700 text-[8px] font-bold text-white ring-2 ring-white dark:ring-zinc-950 transition-all hover:scale-110 select-none -mr-1.5 last:mr-0"
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

const emptySubscribe = () => () => {};

function ClientDate({ date }: { date: string | Date }) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  return <span suppressHydrationWarning>{isClient ? new Date(date).toLocaleDateString() : "..."}</span>;
}
