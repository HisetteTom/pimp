import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface EvaluationMetricsProps {
  totalScoreInfo: {
    currentSum: number;
    maxSum: number;
    anyAssigned: boolean;
    percentage: string;
  };
}

/**
 * Renders live grade statistics based on accumulated criteria input scores.
 * Computes a simple fraction representation of points earned versus the total possible project points.
 */
export function EvaluationMetrics({ totalScoreInfo }: EvaluationMetricsProps) {
  const t = useTranslations('ProfessorEvaluationMetrics');

  return (
    <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
        <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
          {t('liveScore')}
        </span>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-3xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50">
          {totalScoreInfo.anyAssigned ? totalScoreInfo.currentSum : '--'}
          <span className="text-lg font-medium text-zinc-400"> / {totalScoreInfo.maxSum}</span>
        </div>
        <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase"></p>
      </CardContent>
    </Card>
  );
}
