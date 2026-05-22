"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateTaskStatus } from "../../actions";
import { toast } from "sonner";
import { Calendar, User as UserIcon, Plus, AlertTriangle } from "lucide-react";
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

interface KanbanBoardProps {
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

export function KanbanBoard({ initialTasks, projectId, members, teamId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(() => initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByStatus = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  function handleSelectTask(task: Task) {
    setSelectedTask(task);
    setDetailOpen(true);
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id.toString();

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    let targetStatus = activeTask.status;
    let targetIndex = -1;

    // Check if dragging over a column container or a task card
    if (COLUMNS.some((c) => c.id === overId)) {
      targetStatus = overId;
    } else {
      const overTask = tasks.find((t) => t.id.toString() === overId);
      if (overTask) {
        targetStatus = overTask.status;
        targetIndex = tasks.findIndex((t) => t.id === overTask.id);
      }
    }

    if (activeTask.status !== targetStatus) {
      setTasks((prev) => {
        const activeIdx = prev.findIndex((t) => t.id === activeId);
        const updatedTask = { ...prev[activeIdx], status: targetStatus };
        const listWithoutActive = prev.filter((t) => t.id !== activeId);

        if (targetIndex !== -1) {
          const overIdx = listWithoutActive.findIndex((t) => t.id === prev[targetIndex].id);
          listWithoutActive.splice(overIdx >= 0 ? overIdx : listWithoutActive.length, 0, updatedTask);
          return listWithoutActive;
        } else {
          listWithoutActive.push(updatedTask);
          return listWithoutActive;
        }
      });
    } else if (targetIndex !== -1) {
      // Reordering within the same status column
      const activeIdx = tasks.findIndex((t) => t.id === activeId);
      if (activeIdx !== targetIndex) {
        setTasks((prev) => arrayMove(prev, activeIdx, targetIndex));
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as number;
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const dbTask = initialTasks.find((t) => t.id === activeId);
    if (dbTask && activeTask.status !== dbTask.status) {
      try {
        await updateTaskStatus(activeId, activeTask.status, projectId);
      } catch (error) {
        setTasks(initialTasks);
        toast.error("Failed to update task status");
      }
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={tasksByStatus[column.id]}
              members={members}
              projectId={projectId}
              teamId={teamId}
              onSelect={handleSelectTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <KanbanCard task={activeTask} isOverlay members={members} />
          ) : null}
        </DragOverlay>
      </DndContext>

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

function KanbanColumn({ 
  id, 
  title, 
  tasks, 
  members, 
  projectId, 
  teamId,
  onSelect 
}: { 
  id: string; 
  title: string; 
  tasks: Task[]; 
  members: any[]; 
  projectId: number; 
  teamId: number;
  onSelect: (task: Task) => void;
}) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div ref={setNodeRef} className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-2 border-zinc-100 dark:border-zinc-800 flex flex-col gap-y-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold uppercase tracking-widest text-[10px] text-zinc-400 flex items-center gap-2">
          {title}
          <span className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600">{tasks.length}</span>
        </h4>
        <TaskDialog 
          projectId={projectId} 
          teamId={teamId} 
          members={members} 
          defaultStatus={id}
          trigger={
            <Button variant="ghost" size="icon" className="size-6 text-zinc-400 hover:text-primary">
              <Plus className="size-4" />
            </Button>
          }
        />
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-y-4 min-h-[400px]">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} members={members} onSelect={onSelect} />
          ))}
          {tasks.length === 0 && (
            <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center rounded-lg flex-1">
               <p className="text-[10px] text-zinc-400 font-bold uppercase italic">No tasks here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableTaskCard({ task, members, onSelect }: { task: Task; members: any[]; onSelect: (task: Task) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        onSelect(task);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(task);
        }
      }}
      className="focus:outline-none cursor-pointer w-full text-left"
    >
      <KanbanCard task={task} members={members} />
    </div>
  );
}

function KanbanCard({ task, isOverlay, members }: { task: Task; isOverlay?: boolean; members: any[] }) {
  const assigneeIds = task.assignees ? task.assignees.split(",").filter(Boolean) : (task.assigneeId ? [task.assigneeId] : []);
  const assignedMembers = members.filter(m => assigneeIds.includes(m.id));

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
    <Card className={`p-4 border-2 shadow-none transition-colors cursor-grab active:cursor-grabbing ${currentStyle} ${isOverlay ? 'border-primary shadow-xl scale-105' : ''}`}>
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
          <h5 className="font-semibold uppercase text-xs tracking-tight">{task.name}</h5>
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
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
