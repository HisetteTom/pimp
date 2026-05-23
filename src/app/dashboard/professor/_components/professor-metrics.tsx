import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FolderRoot, Users, GraduationCap, ClipboardCheck } from 'lucide-react';

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
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            Active Proposals
          </span>
          <FolderRoot className="size-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">{totalProjects}</div>
          <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
            Total proposed subjects
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            Assigned Teams
          </span>
          <Users className="size-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">{totalTeams}</div>
          <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
            Active working groups
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            Students Enrolled
          </span>
          <GraduationCap className="size-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">
            {totalEnrolledStudents}
          </div>
          <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
            Unique student accounts
          </p>
        </CardContent>
      </Card>

      <Card
        className={`rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none ${pendingDeliverables > 0 ? 'border-amber-500/40 bg-amber-500/[0.02]' : 'bg-card border-zinc-200 dark:border-zinc-800'}`}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            Pending Reviews
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
            Deliverables awaiting review
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
