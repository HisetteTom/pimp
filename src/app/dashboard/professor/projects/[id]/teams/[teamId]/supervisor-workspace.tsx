'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  CheckSquare,
  FileUp,
  Calendar,
  FileText,
  ClipboardCheck,
  ArrowLeft,
  Kanban as KanbanIcon,
  Clock,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ProjectCalendar = dynamic(() => import('@/components/dashboard/project-calendar'), {
  ssr: false,
});
import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { SupervisorFeedbackCard } from './supervisor-feedback-card';
import { ReadOnlyKanban } from './read-only-kanban';
import { ReadOnlyTaskListView } from './read-only-task-list-view';
import { DeliverableReviewer } from '../../deliverable-reviewer';
import { TeamEvaluationTab } from './team-evaluation-tab';
import { TaskStatsAndBreakdown, Member, Task } from './_components/supervisor-charts';
import { TimelineAndEvolution } from './_components/supervisor-timeline';
import { SupervisorNotesEditor } from './_components/supervisor-notes-editor';
import { SupervisorDatesSection } from './_components/supervisor-dates-section';
import { useTranslations } from 'next-intl';

const emptySubscribe = () => () => {};

// Stable mount time to avoid hydration flicker and sync setState
let mountTime: number | null = null;
const getMountTime = () => {
  if (typeof window === 'undefined') return null;
  if (!mountTime) mountTime = Date.now();
  return mountTime;
};

export interface Deliverable {
  id: number;
  name: string;
  source: string | null;
  status: string;
  feedback: string | null;
  teamId: number;
  createdAt: Date;
}

export interface SupervisorWorkspaceProps {
  project: {
    id: number;
    name: string;
    description?: string | null;
    status?: string;
    dateStart?: string | null;
    dateEnd?: string | null;
  };
  team: {
    id: number;
    name: string;
    grade?: string | null;
    feedback?: string | null;
    notes?: string | null;
  };
  members: Member[];
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
  criteria?: { id: number; name: string; description: string | null; maxPoints: number }[];
  initialScores?: { criterionId: number; score?: number | null; comment?: string | null }[];
  role?: string;
}

const EMPTY_CRITERIA: {
  id: number;
  name: string;
  description: string | null;
  maxPoints: number;
}[] = [];
const EMPTY_SCORES: { criterionId: number; score?: number | null; comment?: string | null }[] = [];

export function SupervisorWorkspace({
  project,
  team,
  members,
  tasks,
  livrables,
  checkpoints,
  checkpointNotes,
  criteria = EMPTY_CRITERIA,
  initialScores = EMPTY_SCORES,
  role = 'professor',
}: SupervisorWorkspaceProps) {
  const t = useTranslations('ProfessorSupervisorWorkspace');
  const now = useSyncExternalStore(emptySubscribe, getMountTime, () => null);

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

  // Simulate historical data based on current completion for the chart
  const chartData = [
    { label: 'Start', count: 0 },
    { label: 'Mid', count: Math.floor(completionPercentage / 2) },
    { label: 'Current', count: completionPercentage },
  ];

  const taskStats = [
    { name: 'To Do', value: tasksByStatus.todo.length },
    { name: 'In Progress', value: tasksByStatus.in_progress.length },
    { name: 'Done', value: tasksByStatus.done.length },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Back Link */}
      <div>
        <Link
          href={`/dashboard/professor/projects/${project.id}`}
          className="hover:text-primary inline-flex items-center gap-1.5 text-xs font-black tracking-wider text-zinc-400 uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {t('back')}
        </Link>
      </div>

      {/* Header */}
      <div className="border-zinc-150 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between dark:border-zinc-800">
        <div>
          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            {t('subtitle')}
          </span>
          <h1 className="mt-1 text-4xl font-semibold tracking-tighter text-zinc-900 uppercase dark:text-zinc-100">
            {team.name} <span className="font-medium text-zinc-400">({project.name})</span>
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-y-6">
        <Tabs defaultValue={role === 'jury' ? 'deliverables' : 'overview'} className="w-full">
          <TabsList className="no-scrollbar h-12 w-full justify-start gap-8 overflow-x-auto rounded-none border-b-2 border-zinc-100 bg-transparent p-0 dark:border-zinc-800">
            {role !== 'jury' && (
              <>
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
                >
                  <LayoutDashboard className="size-4" />
                  {t('tabOverview')}
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
                >
                  <CheckSquare className="size-4" />
                  {t('tabList')}
                </TabsTrigger>
                <TabsTrigger
                  value="kanban"
                  className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
                >
                  <KanbanIcon className="size-4" />
                  {t('tabKanban')}
                </TabsTrigger>
              </>
            )}
            <TabsTrigger
              value="deliverables"
              className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
            >
              <FileUp className="size-4" />
              {t('tabDeliverables')}
            </TabsTrigger>
            {role !== 'jury' && (
              <>
                <TabsTrigger
                  value="dates"
                  className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
                >
                  <Clock className="size-4" />
                  {t('tabDates')}
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
                >
                  <Calendar className="size-4" />
                  {t('tabCalendar')}
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
                >
                  <FileText className="size-4" />
                  {t('tabNotes')}
                </TabsTrigger>
              </>
            )}
            <TabsTrigger
              value="evaluation"
              className="data-[state=active]:border-primary h-full gap-2 rounded-none px-2 text-xs font-semibold tracking-widest uppercase data-[state=active]:border-b-4 data-[state=active]:bg-transparent"
            >
              <ClipboardCheck className="size-4" />
              {t('tabEvaluation')}
            </TabsTrigger>
          </TabsList>

          <div className="py-8">
            {role !== 'jury' && (
              <>
                <TabsContent value="overview" className="mt-0 flex flex-col gap-y-8">
                  <TimelineAndEvolution
                    project={project}
                    timelineProgress={timelineProgress}
                    chartData={chartData}
                    completionPercentage={completionPercentage}
                  />

                  <TaskStatsAndBreakdown
                    tasks={tasks}
                    taskStats={taskStats}
                    tasksByStatus={tasksByStatus}
                    members={members}
                  />

                  <SupervisorFeedbackCard
                    key={`${team.id}-overview-${team.feedback}`}
                    teamId={team.id}
                    projectId={project.id}
                    teamName={team.name}
                    initialFeedback={team.feedback}
                    type="overview"
                    readOnly={role === 'jury'}
                  />
                </TabsContent>

                <TabsContent value="list" className="mt-0 flex flex-col gap-y-8">
                  <ReadOnlyTaskListView initialTasks={tasks} members={members} />
                  <SupervisorFeedbackCard
                    key={`${team.id}-list-${team.feedback}`}
                    teamId={team.id}
                    projectId={project.id}
                    teamName={team.name}
                    initialFeedback={team.feedback}
                    type="kanban"
                    readOnly={role === 'jury'}
                  />
                </TabsContent>

                <TabsContent value="kanban" className="mt-0 flex flex-col gap-y-8">
                  <ReadOnlyKanban initialTasks={tasks} members={members} />
                  <SupervisorFeedbackCard
                    key={`${team.id}-kanban-${team.feedback}`}
                    teamId={team.id}
                    projectId={project.id}
                    teamName={team.name}
                    initialFeedback={team.feedback}
                    type="kanban"
                    readOnly={role === 'jury'}
                  />
                </TabsContent>
              </>
            )}

            <TabsContent value="deliverables" className="mt-0 flex flex-col gap-y-8">
              <div className="space-y-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-semibold tracking-tight uppercase">
                    {t('deliverablesHeader', { count: livrables.length })}
                  </h3>
                </div>

                {livrables.length === 0 ? (
                  <div className="rounded-none border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/5">
                    <p className="text-sm font-bold tracking-wide text-zinc-400 uppercase italic">
                      {t('noDeliverables')}
                    </p>
                  </div>
                ) : (
                  <div className="grid max-w-4xl gap-6">
                    {livrables.map((deliv) => (
                      <DeliverableReviewer
                        key={deliv.id}
                        deliverableId={deliv.id}
                        projectId={project.id}
                        deliverableName={deliv.name}
                        deliverableSource={deliv.source}
                        initialStatus={deliv.status}
                        initialFeedback={deliv.feedback}
                        readOnly={role === 'jury'}
                      />
                    ))}
                  </div>
                )}
              </div>
              {role !== 'jury' && (
                <SupervisorFeedbackCard
                  key={`${team.id}-deliverables-${team.feedback}`}
                  teamId={team.id}
                  projectId={project.id}
                  teamName={team.name}
                  initialFeedback={team.feedback}
                  type="deliverables"
                  readOnly={role === 'jury'}
                />
              )}
            </TabsContent>

            {role !== 'jury' && (
              <>
                <TabsContent value="dates" className="mt-0 flex flex-col gap-y-8">
                  <SupervisorDatesSection
                    projectId={project.id}
                    teamId={team.id}
                    checkpoints={checkpoints}
                    checkpointNotes={checkpointNotes}
                    readOnly={role === 'jury'}
                  />
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                  <ProjectCalendar
                    project={project}
                    tasks={tasks}
                    checkpoints={checkpoints}
                    checkpointNotes={checkpointNotes}
                    members={members}
                  />
                </TabsContent>

                <TabsContent value="notes" className="mt-0 flex flex-col gap-y-8">
                  <SupervisorNotesEditor
                    key={team.id}
                    teamId={team.id}
                    projectId={project.id}
                    initialNotes={team.notes ?? null}
                    readOnly={role === 'jury'}
                  />
                </TabsContent>
              </>
            )}

            <TabsContent value="evaluation" className="mt-0 flex flex-col gap-y-8">
              <TeamEvaluationTab
                projectId={project.id}
                teamId={team.id}
                criteria={criteria}
                initialScores={initialScores}
                team={team}
                role={role}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
