'use client';

import { Button } from '@/components/ui/button';
import { KanbanBoard } from '../kanban-board';
import { TaskListView } from '../task-list-view';
import {
  StudentTimelineAndEvolution,
  StudentTaskStatsAndBreakdown,
  ClientDate,
  Task,
} from './student-charts';

export interface Member {
  id: string;
  name: string;
  responsabilityId: number | null;
}

export interface Deliverable {
  id: number;
  name: string;
  source: string | null;
  status: string;
  feedback: string | null;
  teamId: number;
  createdAt: Date;
}

const FeedbackSlot = ({ title, feedback }: { title: string; feedback?: string | null }) => (
  <div className="border-primary/20 bg-primary/5 mt-[-16px] flex flex-col gap-y-2 rounded-none border-2 p-6">
    <h4 className="text-primary text-[10px] font-semibold tracking-widest uppercase">
      Teacher Feedback - {title}
    </h4>
    {feedback ? (
      <p className="text-sm font-medium whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
        {feedback}
      </p>
    ) : (
      <p className="text-sm font-medium text-zinc-600 italic dark:text-zinc-400">
        No feedback from supervisor yet.
      </p>
    )}
  </div>
);

export interface StudentOverviewSectionProps {
  project: {
    id: number;
    name: string;
    description?: string | null;
    dateStart?: string | null;
    dateEnd?: string | null;
  };
  timelineProgress: number;
  chartData: { label: string; count: number }[];
  completionPercentage: number;
  tasks: Task[];
  taskStats: { name: string; value: number }[];
  tasksByStatus: {
    todo: Task[];
    in_progress: Task[];
    done: Task[];
  };
  feedback: string;
}

export function StudentOverviewSection({
  project,
  timelineProgress,
  chartData,
  completionPercentage,
  tasks,
  taskStats,
  tasksByStatus,
  feedback,
}: StudentOverviewSectionProps) {
  return (
    <div className="flex flex-col gap-y-8">
      <StudentTimelineAndEvolution
        project={project}
        timelineProgress={timelineProgress}
        chartData={chartData}
        completionPercentage={completionPercentage}
      />

      <StudentTaskStatsAndBreakdown
        tasks={tasks}
        taskStats={taskStats}
        tasksByStatus={tasksByStatus}
      />
      <FeedbackSlot title="Overview" feedback={feedback} />
    </div>
  );
}

export interface StudentKanbanSectionProps {
  tasks: Task[];
  project: { id: number; name: string };
  team: { id: number; members: Member[] };
  feedback: string;
}

export function StudentKanbanSection({
  tasks,
  project,
  team,
  feedback,
}: StudentKanbanSectionProps) {
  return (
    <div className="flex flex-col gap-y-8">
      <KanbanBoard
        key={
          tasks.length === 0
            ? 'empty'
            : tasks
                .map(
                  (t) =>
                    `${t.id}-${t.status}-${t.name}-${t.assigneeId}-${t.assignees || ''}-${t.priority}-${t.deadline}-${t.description}`,
                )
                .join(',')
        }
        initialTasks={tasks}
        projectId={project.id}
        members={team.members}
        teamId={team.id}
      />
      <FeedbackSlot title="Kanban" feedback={feedback} />
    </div>
  );
}

export interface StudentListSectionProps {
  tasks: Task[];
  project: { id: number; name: string };
  team: { id: number; members: Member[] };
  feedback: string;
}

export function StudentListSection({ tasks, project, team, feedback }: StudentListSectionProps) {
  return (
    <div className="flex flex-col gap-y-8">
      <TaskListView
        key={
          tasks.length === 0
            ? 'empty-list'
            : tasks
                .map(
                  (t) =>
                    `${t.id}-${t.status}-${t.name}-${t.assigneeId}-${t.assignees || ''}-${t.priority}-${t.deadline}-${t.description}`,
                )
                .join(',')
        }
        initialTasks={tasks}
        projectId={project.id}
        members={team.members}
        teamId={team.id}
      />
      <FeedbackSlot title="List" feedback={feedback} />
    </div>
  );
}

export interface StudentDeliverablesSectionProps {
  project: { id: number; name: string };
  team: { id: number; name: string };
  livrables: Deliverable[];
  feedback: string;
}

export function StudentDeliverablesSection({
  livrables,
  feedback,
}: StudentDeliverablesSectionProps) {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight uppercase">Files & Deliverables</h3>
        <Button className="text-xs font-semibold tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)]">
          Upload File
        </Button>
      </div>
      <div className="overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                File Name
              </th>
              <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {livrables.length > 0 ? (
              livrables.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                >
                  <td className="p-4 font-bold uppercase">{l.name}</td>
                  <td className="p-4 font-mono text-xs">
                    <ClientDate date={l.createdAt} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="p-12 text-center font-medium text-zinc-400 italic">
                  No files uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <FeedbackSlot title="Deliverables" feedback={feedback} />
    </div>
  );
}
