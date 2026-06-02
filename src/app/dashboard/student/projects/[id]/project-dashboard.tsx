'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  CheckSquare,
  FileUp,
  Kanban as KanbanIcon,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
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
import dynamic from 'next/dynamic';
import { TaskDetailDialog } from './task-detail-dialog';
import { useTranslations } from 'next-intl';

const ProjectCalendar = dynamic(() => import('@/components/dashboard/project-calendar'), {
  ssr: false,
});

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
  const t = useTranslations('ProjectDashboard');
  const now = useSyncExternalStore(emptySubscribe, getMountTime, () => null);

  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleSelectTask = (task: import('@/components/dashboard/project-calendar').Task) => {
    setSelectedTask(task as unknown as Task);
    setDetailOpen(true);
  };

  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    if (
      initialTab &&
      ['overview', 'list', 'kanban', 'deliverables', 'dates', 'calendar'].includes(initialTab)
    ) {
      setActiveTab(initialTab);
    }
  }

  const timelineProgress = (() => {
    if (!project.dateStart || !project.dateEnd || !now) return 0;
    const start = new Date(project.dateStart).getTime();
    const end = new Date(project.dateEnd).getTime();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  })();

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const completionPercentage =
    tasks.length === 0 ? 0 : Math.round((tasksByStatus.done.length / tasks.length) * 100);

  const chartData = (() => {
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
  })();

  const taskStats = [
    { name: 'To Do', value: tasksByStatus.todo.length },
    { name: 'In Progress', value: tasksByStatus.in_progress.length },
    { name: 'Done', value: tasksByStatus.done.length },
  ];

  const parsedFeedback = (() => {
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
  })();

  return (
    <div className="flex flex-col gap-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="no-scrollbar h-12 w-full justify-start gap-8 overflow-x-auto rounded-none border-b-2 border-zinc-100 bg-transparent p-0 dark:border-zinc-800">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
          >
            <LayoutDashboard className="size-4" />
            {t('overview')}
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
          >
            <CheckSquare className="size-4" />
            {t('list')}
          </TabsTrigger>
          <TabsTrigger
            value="kanban"
            className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
          >
            <KanbanIcon className="size-4" />
            {t('kanban')}
          </TabsTrigger>
          <TabsTrigger
            value="deliverables"
            className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
          >
            <FileUp className="size-4" />
            {t('deliverables')}
          </TabsTrigger>
          <TabsTrigger
            value="dates"
            className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
          >
            <Clock className="size-4" />
            {t('dates')}
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
          >
            <CalendarIcon className="size-4" />
            {t('calendar')}
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

          <TabsContent value="calendar" className="mt-0">
            <ProjectCalendar
              project={project}
              tasks={tasks}
              checkpoints={checkpoints}
              checkpointNotes={checkpointNotes}
              members={team.members}
              onSelectTask={handleSelectTask}
            />
          </TabsContent>
        </div>
      </Tabs>
      <div className="hidden" aria-hidden="true">
        {prevInitialTab}
      </div>

      <TaskDetailDialog
        key={selectedTask?.id ?? 'none'}
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        members={team.members}
        projectId={project.id}
      />
    </div>
  );
}
