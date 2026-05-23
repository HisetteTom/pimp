'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, CheckSquare, FileUp, Kanban as KanbanIcon, Clock } from 'lucide-react';
import { useState, useMemo, useSyncExternalStore } from 'react';
import {
  StudentOverviewSection,
  StudentKanbanSection,
  StudentListSection,
  StudentDeliverablesSection,
  Member,
  Deliverable,
} from './_components/student-sections';
import { StudentDatesSection } from './_components/student-dates-section';
import { Task } from './_components/student-charts';

const emptySubscribe = () => () => {};

// Stable mount time to avoid hydration flicker and sync setState
let mountTime: number | null = null;
const getMountTime = () => {
  if (typeof window === 'undefined') return null;
  if (!mountTime) mountTime = Date.now();
  return mountTime;
};

export interface ProjectDashboardProps {
  project: {
    id: number;
    name: string;
    description?: string | null;
    dateStart?: string | null;
    dateEnd?: string | null;
  };
  team: {
    id: number;
    name: string;
    feedback?: string | null;
    notes?: string | null;
    members: Member[];
  };
  tasks: Task[];
  livrables: Deliverable[];
  checkpoints: {
    id: number;
    title: string;
    description?: string | null;
    dueDate: Date;
    projectId: number;
  }[];
  checkpointNotes: { id: number; checkpointId: number; teamId: number; notes: string | null }[];
  initialTab?: string;
}

export function ProjectDashboard({
  project,
  team,
  tasks,
  livrables,
  checkpoints,
  checkpointNotes,
  initialTab,
}: ProjectDashboardProps) {
  const now = useSyncExternalStore(emptySubscribe, getMountTime, () => null);

  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    if (
      initialTab &&
      ['overview', 'list', 'kanban', 'deliverables', 'dates'].includes(initialTab)
    ) {
      setActiveTab(initialTab);
    }
  }

  const timelineProgress = useMemo(() => {
    if (!project.dateStart || !project.dateEnd || !now) return 0;
    const start = new Date(project.dateStart).getTime();
    const end = new Date(project.dateEnd).getTime();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  }, [project.dateStart, project.dateEnd, now]);

  const tasksByStatus = useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === 'todo'),
      in_progress: tasks.filter((t) => t.status === 'in_progress'),
      done: tasks.filter((t) => t.status === 'done'),
    }),
    [tasks],
  );

  const completionPercentage = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((tasksByStatus.done.length / tasks.length) * 100);
  }, [tasks, tasksByStatus]);

  const chartData = useMemo(() => {
    const dates: string[] = [];
    const doneTasks: (Task & { deadlineDate: Date })[] = [];
    for (const t of tasks) {
      if (t.status === 'done' && t.deadline) {
        doneTasks.push({
          ...t,
          deadlineDate: new Date(t.deadline),
        });
      }
    }
    doneTasks.sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime());

    // Generate last 7 days chart labels
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString());
    }

    let runningCount = tasks.filter((t) => t.status === 'done').length - doneTasks.length;

    return dates.map((dateStr) => {
      const dayTasks = doneTasks.filter((t) => t.deadlineDate.toLocaleDateString() === dateStr);
      runningCount += dayTasks.length;
      const pct = tasks.length > 0 ? Math.round((runningCount / tasks.length) * 100) : 0;
      return { label: dateStr, count: pct };
    });
  }, [tasks]);

  const taskStats = useMemo(
    () => [
      { name: 'To Do', value: tasksByStatus.todo.length },
      { name: 'In Progress', value: tasksByStatus.in_progress.length },
      { name: 'Done', value: tasksByStatus.done.length },
    ],
    [tasksByStatus],
  );

  const parsedFeedback = useMemo(() => {
    if (team.feedback) {
      try {
        if (team.feedback.startsWith('{')) {
          const parsed = JSON.parse(team.feedback);
          return {
            overview: parsed.overview || '',
            kanban: parsed.kanban || parsed.tasks || '',
            deliverables: parsed.deliverables || '',
          };
        }
      } catch {}
    }
    return { overview: team.feedback || '', kanban: '', deliverables: '' };
  }, [team.feedback]);

  return (
    <div className="flex flex-col gap-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="no-scrollbar h-12 w-full justify-start gap-8 overflow-x-auto rounded-none border-b-2 border-zinc-100 bg-transparent p-0 dark:border-zinc-800">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
          >
            <LayoutDashboard className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
          >
            <CheckSquare className="size-4" />
            List
          </TabsTrigger>
          <TabsTrigger
            value="kanban"
            className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
          >
            <KanbanIcon className="size-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger
            value="deliverables"
            className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
          >
            <FileUp className="size-4" />
            Deliverables
          </TabsTrigger>
          <TabsTrigger
            value="dates"
            className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
          >
            <Clock className="size-4" />
            Dates
          </TabsTrigger>
        </TabsList>

        <div className="py-8">
          <TabsContent value="overview" className="mt-0">
            <StudentOverviewSection
              project={project}
              timelineProgress={timelineProgress}
              chartData={chartData}
              completionPercentage={completionPercentage}
              tasks={tasks}
              taskStats={taskStats}
              tasksByStatus={tasksByStatus}
              feedback={parsedFeedback.overview}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <StudentListSection
              tasks={tasks}
              project={project}
              team={team}
              feedback={parsedFeedback.kanban}
            />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0">
            <StudentKanbanSection
              tasks={tasks}
              project={project}
              team={team}
              feedback={parsedFeedback.kanban}
            />
          </TabsContent>

          <TabsContent value="deliverables" className="mt-0">
            <StudentDeliverablesSection
              project={project}
              team={team}
              livrables={livrables}
              feedback={parsedFeedback.deliverables}
            />
          </TabsContent>

          <TabsContent value="dates" className="mt-0">
            <StudentDatesSection checkpoints={checkpoints} checkpointNotes={checkpointNotes} />
          </TabsContent>
        </div>
      </Tabs>
      <div className="hidden" aria-hidden="true">
        {prevInitialTab}
      </div>
    </div>
  );
}
