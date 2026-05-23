'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Crown } from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false },
);
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Sector = dynamic(() => import('recharts').then((mod) => mod.Sector), { ssr: false });

export interface Member {
  id: string;
  name: string;
  responsabilityId: number | null;
}

export interface Task {
  id: number;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: Date | string | null;
  assigneeId: string | null;
  assignees?: string | null;
}

export interface PieGradientProps {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
  payload?: {
    name: string;
  };
  index?: number;
}

export const PieGradient = (props: PieGradientProps) => {
  const entryName = props.payload?.name || '';
  const colorMap: Record<string, string> = {
    'To Do': '#a1a1aa',
    'In Progress': '#52525b',
    Done: '#ff7800',
  };
  const color = colorMap[entryName] || '#a1a1aa';

  return (
    <>
      <defs>
        <radialGradient
          id={`fillGradient-${props.index}`}
          cx={props.cx}
          cy={props.cy}
          r={props.outerRadius}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0} />
          <stop offset="100%" stopColor={color} stopOpacity={0.8} />
        </radialGradient>
      </defs>
      <Sector
        {...(props as Record<string, unknown>)}
        fill={`url(#fillGradient-${props.index})`}
        stroke={color}
        strokeWidth={1.5}
      />
    </>
  );
};

export interface TaskStatsAndBreakdownProps {
  tasks: Task[];
  taskStats: { name: string; value: number }[];
  tasksByStatus: { todo: Task[]; in_progress: Task[]; done: Task[] };
  members: Member[];
}

export function TaskStatsAndBreakdown({
  tasks,
  taskStats,
  tasksByStatus,
  members,
}: TaskStatsAndBreakdownProps) {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      <Card className="group hover:border-primary/50 relative flex h-full flex-col overflow-hidden rounded-none border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl md:col-span-1 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.1]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="task-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#task-grid)" />
          </svg>
        </div>

        <CardHeader className="relative z-10">
          <CardTitle className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
            Task Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 h-[200px]">
          {tasks.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  shape={PieGradient}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] font-bold text-zinc-400 uppercase">
              No Tasks
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col justify-between gap-y-4 md:col-span-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight uppercase">Status breakdown</h3>
          <div className="flex flex-col gap-y-4">
            <div className="flex h-12 w-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <div
                className="h-full bg-zinc-400 transition-all dark:bg-zinc-600"
                style={{ width: `${(tasksByStatus.todo.length / (tasks.length || 1)) * 100}%` }}
                title="To Do"
              />
              <div
                className="h-full bg-zinc-600 transition-all dark:bg-zinc-400"
                style={{
                  width: `${(tasksByStatus.in_progress.length / (tasks.length || 1)) * 100}%`,
                }}
                title="In Progress"
              />
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${(tasksByStatus.done.length / (tasks.length || 1)) * 100}%` }}
                title="Done"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-zinc-400 dark:bg-zinc-600" />
                <span className="text-zinc-450 text-[10px] font-bold uppercase dark:text-zinc-400">
                  To Do
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-zinc-650 size-3 dark:bg-zinc-400" />
                <span className="text-zinc-450 text-[10px] font-bold uppercase dark:text-zinc-400">
                  In Progress
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary size-3" />
                <span className="text-zinc-450 text-[10px] font-bold uppercase dark:text-zinc-400">
                  Done
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <h4 className="text-[9px] font-semibold tracking-widest text-zinc-400 uppercase">
            Enrolled Team Members ({members.length})
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {members.length === 0 ? (
              <p className="text-xs font-bold text-zinc-400 uppercase italic">
                No members enrolled yet.
              </p>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-1.5 rounded-none border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-[10px] font-bold text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-900/10 dark:text-zinc-300"
                >
                  {m.responsabilityId ? (
                    <Crown className="size-3 text-amber-500" />
                  ) : (
                    <User className="size-3 text-zinc-500 dark:text-zinc-400" />
                  )}
                  <span>{m.name || 'Unknown'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
