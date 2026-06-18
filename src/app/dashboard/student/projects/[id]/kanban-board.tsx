'use client';

import { useState } from 'react';
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
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { updateTaskStatus } from '../../actions';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { TaskDialog } from './task-dialog';
import { TaskDetailDialog } from './task-detail-dialog';
import { Task, KanbanCard, SortableTaskCard } from './_components/kanban-components';
import { useTranslations } from 'next-intl';

interface KanbanBoardProps {
  initialTasks: Task[];
  projectId: number;
  members: { id: string; name: string }[];
  teamId: number;
}

/**
 * Renders the interactive Kanban board for student task management.
 * Utilizes dnd-kit pointer/keyboard sensors and sortable contexts to allow dragging
 * task cards between status columns (todo, in_progress, done), persisting updates.
 */
export function KanbanBoard({ initialTasks, projectId, members, teamId }: KanbanBoardProps) {
  const t = useTranslations('KanbanBoard');
  const [tasks, setTasks] = useState<Task[]>(() => initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const COLUMNS = [
    { id: 'todo', title: t('todo') },
    { id: 'in_progress', title: t('inProgress') },
    { id: 'done', title: t('done') },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const tasksByStatus: Record<string, Task[]> = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeId = active.id as number;
    const task = tasks.find((t) => t.id === activeId);
    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (!activeTaskObj) return;

    const isOverColumn =
      typeof overId === 'string' && ['todo', 'in_progress', 'done'].includes(overId);

    if (isOverColumn) {
      const colId = overId as string;
      if (activeTaskObj.status !== colId) {
        setTasks((prev) => prev.map((t) => (t.id === activeId ? { ...t, status: colId } : t)));
      }
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && activeTaskObj.status !== overTask.status) {
        setTasks((prev) =>
          prev.map((t) => (t.id === activeId ? { ...t, status: overTask.status } : t)),
        );
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (!activeTaskObj) return;

    const isOverColumn =
      typeof overId === 'string' && ['todo', 'in_progress', 'done'].includes(overId);

    if (!isOverColumn) {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (activeIndex !== overIndex) {
          setTasks((prev) => arrayMove(prev, activeIndex, overIndex));
        }
      }
    }

    const dbTask = initialTasks.find((t) => t.id === activeId);
    if (dbTask && activeTaskObj.status !== dbTask.status) {
      try {
        await updateTaskStatus(activeId, activeTaskObj.status, projectId);
      } catch {
        setTasks(initialTasks);
        toast.error(t('failedUpdate'));
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
          {activeTask ? <KanbanCard task={activeTask} isOverlay members={members} /> : null}
        </DragOverlay>
      </DndContext>

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

function KanbanColumn({
  id,
  title,
  tasks,
  members,
  projectId,
  teamId,
  onSelect,
}: {
  id: string;
  title: string;
  tasks: Task[];
  members: { id: string; name: string }[];
  projectId: number;
  teamId: number;
  onSelect: (task: Task) => void;
}) {
  const t = useTranslations('KanbanBoard');
  const { setNodeRef } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-y-4 border-2 border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <div className="mb-2 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
          {title}
          <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-zinc-600 dark:bg-zinc-800">
            {tasks.length}
          </span>
        </h4>
        <TaskDialog
          projectId={projectId}
          teamId={teamId}
          members={members}
          defaultStatus={id}
          trigger={
            <Button variant="ghost" size="icon" className="hover:text-primary size-6 text-zinc-400">
              <Plus className="size-4" />
            </Button>
          }
        />
      </div>
      <SortableContext items={tasks.map((t) => t.id)}>
        <div className="flex min-h-[400px] flex-col gap-y-4">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} members={members} onSelect={onSelect} />
          ))}
          {tasks.length === 0 && (
            <div className="flex-1 rounded-lg border-2 border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase italic">{t('noTasks')}</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
