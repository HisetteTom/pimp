'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export interface TimelineAndEvolutionProps {
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

/**
 * Renders project progress indicators.
 * Combines date boundaries, active progress indicators, and an area chart
 * mapping task completion percentages over time.
 */
export function TimelineAndEvolution({
  project,
  timelineProgress,
  chartData,
  completionPercentage,
}: TimelineAndEvolutionProps) {
  const t = useTranslations('ProfessorSupervisorTimeline');

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="group hover:border-primary/50 relative flex h-full flex-col overflow-hidden rounded-none border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.1]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="timeline-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#timeline-grid)" />
          </svg>
        </div>

        <CardHeader className="relative z-10 flex flex-row items-center justify-between gap-y-0 pb-2">
          <CardTitle className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">
            {t('timelineTitle')}
          </CardTitle>
          <Clock className="size-4 text-zinc-400" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col gap-y-6 pt-4">
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
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="from-primary/80 to-primary h-full rounded-full bg-linear-to-r shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] transition-all duration-1000"
                style={{ width: `${timelineProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group hover:border-primary/50 relative flex h-full flex-col overflow-hidden rounded-none border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.1]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="evolution-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#evolution-grid)" />
          </svg>
        </div>

        <CardHeader className="relative z-10">
          <CardTitle className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">
            {t('workEvolution')}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 h-[200px] w-full p-0">
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
        <div className="relative z-10 px-6 pb-6 text-center">
          <p className="text-secondary text-4xl font-semibold tracking-tighter">
            {completionPercentage}%
          </p>
          <p className="mt-1 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            {t('overallCompletion')}
          </p>
        </div>
      </Card>
    </div>
  );
}
