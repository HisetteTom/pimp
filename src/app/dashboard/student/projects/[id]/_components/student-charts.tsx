'use client';

import { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false },
);
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), {
  ssr: false,
});
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Sector = dynamic(() => import('recharts').then((mod) => mod.Sector), { ssr: false });

export interface Task {
  id: number;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: Date | null;
  assigneeId: string | null;
  assignees?: string | null;
}

interface PieGradientProps {
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

const emptySubscribe = () => () => {};

const colorMap: Record<string, string> = {
  'To Do': '#a1a1aa',
  'In Progress': '#52525b',
  Done: '#ff7800',
};

const PieGradient = (props: PieGradientProps) => {
  const entryName = props.payload?.name || '';
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

export function ClientDate({ date }: { date: string | Date }) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  return (
    <span suppressHydrationWarning>{isClient ? new Date(date).toLocaleDateString() : '...'}</span>
  );
}

export interface StudentTimelineAndEvolutionProps {
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
}

export function StudentTimelineAndEvolution({
  project,
  timelineProgress,
  chartData,
}: StudentTimelineAndEvolutionProps) {
  const t = useTranslations('StudentCharts');
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="border-2 border-zinc-200 shadow-none dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <CardTitle className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">
            {t('projectTimeline')}
          </CardTitle>
          <Clock className="size-4 text-zinc-400" />
        </CardHeader>
        <CardContent className="flex flex-col gap-y-6 pt-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase">{t('startDate')}</p>
              <p
                className="font-mono text-xl font-semibold tracking-tighter"
                suppressHydrationWarning
              >
                {project.dateStart ? new Date(project.dateStart).toLocaleDateString() : t('tbd')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-zinc-400 uppercase">{t('finalDeadline')}</p>
              <p
                className="font-mono text-xl font-semibold tracking-tighter"
                suppressHydrationWarning
              >
                {project.dateEnd ? new Date(project.dateEnd).toLocaleDateString() : t('tbd')}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <div className="flex justify-between text-[10px] font-semibold tracking-tighter uppercase">
              <span>{t('timeElapsed')}</span>
              <span>{timelineProgress}%</span>
            </div>
            <div className="h-4 w-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              <div
                className="bg-primary h-full transition-all duration-1000"
                style={{ width: `${timelineProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-2 border-zinc-200 shadow-none dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">
            {t('workEvolution')}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] w-full p-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                vertical={false}
                opacity={0.1}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'black',
                  border: 'none',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCount)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
        <div className="px-6 pb-6 text-center">
          <p className="mt-1 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            {t('overallCompletion')}
          </p>
        </div>
      </Card>
    </div>
  );
}

export interface StudentTaskStatsAndBreakdownProps {
  tasks: Task[];
  taskStats: { name: string; value: number }[];
  tasksByStatus: {
    todo: Task[];
    in_progress: Task[];
    done: Task[];
  };
}

export function StudentTaskStatsAndBreakdown({
  tasks,
  taskStats,
  tasksByStatus,
}: StudentTaskStatsAndBreakdownProps) {
  const t = useTranslations('StudentCharts');

  // Format localized status labels for chart gradient keys
  const localizedStats = taskStats.map((s) => {
    let name = s.name;
    if (s.name === 'To Do') name = t('todo');
    if (s.name === 'In Progress') name = t('inProgress');
    if (s.name === 'Done') name = t('done');
    return { ...s, name };
  });

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <Card className="border-2 border-zinc-100 shadow-none md:col-span-1 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
            {t('taskDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          {tasks.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={localizedStats}
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
              {t('noTasks')}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-y-4 md:col-span-2">
        <h3 className="text-lg font-semibold tracking-tight uppercase">{t('statusBreakdown')}</h3>
        <div className="flex flex-col gap-y-4">
          <div className="flex h-12 w-full overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">
            <div
              className="h-full bg-zinc-400 transition-all dark:bg-zinc-600"
              style={{ width: `${(tasksByStatus.todo.length / (tasks.length || 1)) * 100}%` }}
              title={t('todo')}
            />
            <div
              className="h-full bg-zinc-600 transition-all dark:bg-zinc-400"
              style={{
                width: `${(tasksByStatus.in_progress.length / (tasks.length || 1)) * 100}%`,
              }}
              title={t('inProgress')}
            />
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${(tasksByStatus.done.length / (tasks.length || 1)) * 100}%` }}
              title={t('done')}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="size-3 bg-zinc-400 dark:bg-zinc-600" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">{t('todo')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 bg-zinc-600 dark:bg-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">
                {t('inProgress')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary size-3" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">{t('done')}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-y-4">
          <h4 className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
            {t('latestTasks')}
          </h4>
          <div className="flex flex-col gap-y-2">
            {tasks.slice(0, 3).map((tObj) => (
              <div
                key={tObj.id}
                className="flex items-center justify-between border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <span className="text-xs font-semibold uppercase">{tObj.name}</span>
                <Badge variant="outline" className="text-[8px] uppercase">
                  {tObj.status === 'todo'
                    ? t('todo')
                    : tObj.status === 'in_progress'
                      ? t('inProgress')
                      : t('done')}
                </Badge>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-xs text-zinc-400 italic">{t('noTasksYet')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
