import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Award } from "lucide-react";

interface EvaluationMetricsProps {
  totalScoreInfo: {
    currentSum: number;
    maxSum: number;
    anyAssigned: boolean;
    percentage: string;
  };
}

export function EvaluationMetrics({ totalScoreInfo }: EvaluationMetricsProps) {
  return (
    <Card className="border-2 border-zinc-200 dark:border-zinc-800 bg-card rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-none transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-y-0">
        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Live Score</span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50 font-mono tracking-tighter">
          {totalScoreInfo.anyAssigned ? totalScoreInfo.currentSum : "--"}
          <span className="text-zinc-400 font-medium text-lg"> / {totalScoreInfo.maxSum}</span>
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
        </p>
      </CardContent>
    </Card>
  );
}
