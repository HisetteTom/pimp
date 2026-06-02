import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FolderRoot, Users, GraduationCap, ClipboardCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProfessorMetricsProps {
  totalProjects: number;
  totalTeams: number;
  totalEnrolledStudents: number;
  pendingDeliverables: number;
}

export function ProfessorMetrics({
  totalProjects,
  totalTeams,
  totalEnrolledStudents,
  pendingDeliverables,
}: ProfessorMetricsProps) {
  const t = useTranslations('ProfessorMetrics');

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            {t('activeProposals')}
          </span>
          <FolderRoot className="size-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">{totalProjects}</div>
          <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
            {t('totalSubjects')}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            {t('assignedTeams')}
          </span>
          <Users className="size-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">{totalTeams}</div>
          <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
            {t('activeGroups')}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            {t('studentsEnrolled')}
          </span>
          <GraduationCap className="size-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">
            {totalEnrolledStudents}
          </div>
          <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
            {t('uniqueAccounts')}
          </p>
        </CardContent>
      </Card>

      <Card
        className={`rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none ${pendingDeliverables > 0 ? 'border-amber-500/40 bg-amber-500/[0.02]' : 'bg-card border-zinc-200 dark:border-zinc-800'}`}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            {t('pendingReviews')}
          </span>
          <ClipboardCheck
            className={`size-4 ${pendingDeliverables > 0 ? 'animate-pulse text-amber-500' : 'text-purple-500'}`}
          />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">
            {pendingDeliverables}
          </div>
          <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
            {t('awaitingReview')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
