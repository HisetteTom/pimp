'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  CheckSquare,
  FileUp,
  Kanban as KanbanIcon,
  Clock,
  Calendar as CalendarIcon,
  ClipboardCheck,
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
    showEvaluationGrid: boolean;
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
  criteria: {
    id: number;
    name: string;
    description?: string | null;
    maxPoints: number;
  }[];
}

export function ProjectDashboard({
  project,
  team,
  tasks,
  livrables,
  checkpoints,
  checkpointNotes,
  initialTab,
  criteria,
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
      ['overview', 'list', 'kanban', 'deliverables', 'dates', 'calendar', 'evaluation'].includes(
        initialTab,
      )
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
          {project.showEvaluationGrid && (
            <TabsTrigger
              value="evaluation"
              className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
            >
              <ClipboardCheck className="size-4" />
              {t('evaluationGrid')}
            </TabsTrigger>
          )}
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

          {project.showEvaluationGrid && (
            <TabsContent value="evaluation" className="mt-0">
              <div className="bg-card border-2 border-zinc-200 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
                <div className="mb-6 flex flex-col gap-y-1 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <span className="text-[9px] font-bold tracking-widest text-purple-600 uppercase dark:text-purple-400">
                    {t('evaluationGridSubtitle')}
                  </span>
                  <h2 className="text-xl leading-tight font-semibold text-zinc-900 uppercase dark:text-zinc-100">
                    {t('evaluationGridTitle')}
                  </h2>
                </div>

                {criteria.length === 0 ? (
                  <p className="text-sm font-medium text-zinc-500">{t('noCriteria')}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
                      <thead className="bg-zinc-50 text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:bg-zinc-900/50">
                        <tr>
                          <th scope="col" className="px-6 py-4">
                            {t('criterionName')}
                          </th>
                          <th scope="col" className="px-6 py-4">
                            {t('criterionDescription')}
                          </th>
                          <th scope="col" className="px-6 py-4 text-right">
                            {t('criterionMaxPoints')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {criteria.map((c) => (
                          <tr
                            key={c.id}
                            className="bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-950/20 dark:hover:bg-zinc-900/30"
                          >
                            <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                              {c.name}
                            </td>
                            <td className="px-6 py-4 text-xs">{c.description || '-'}</td>
                            <td className="px-6 py-4 text-right font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              /{c.maxPoints}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
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
