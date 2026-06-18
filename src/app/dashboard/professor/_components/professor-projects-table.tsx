import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { useTranslations } from 'next-intl';

interface ProjectRow {
  id: number;
  name: string;
  description: string | null;
  status: string;
  dateStart: string | null;
  dateEnd: string | null;
  maxGroups: number;
  teamsCount: number;
  progress: number;
  totalTasksCount: number;
  doneTasksCount: number;
}

interface ProfessorProjectsTableProps {
  projects: ProjectRow[];
  totalProjects: number;
}

/**
 * Renders a structured projects data table listing active projects.
 * Incorporates detailed status badges, groups allocation counters, project timelines,
 * and management navigation control buttons.
 */
export function ProfessorProjectsTable({ projects, totalProjects }: ProfessorProjectsTableProps) {
  const t = useTranslations('ProfessorProjectsTable');

  return (
    <section id="projects" className="scroll-mt-10 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
          {t('activeProjects')}
        </h2>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <Badge className="rounded-none bg-zinc-900 font-black text-white dark:bg-zinc-100 dark:text-zinc-900">
          {totalProjects}
        </Badge>
      </div>

      <Card className="bg-card overflow-hidden rounded-none border-2 border-zinc-200 dark:border-zinc-800">
        <Table>
          <TableHeader className="border-b-2 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[35%] py-4 pl-6 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                {t('projectSubject')}
              </TableHead>
              <TableHead className="w-[15%] p-4 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                {t('status')}
              </TableHead>
              <TableHead className="w-[15%] p-4 text-center text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                {t('teams')}
              </TableHead>
              <TableHead className="w-[20%] p-4 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                {t('timeline')}
              </TableHead>
              <TableHead className="w-[15%] p-4 text-left text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                {t('action')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center font-medium text-zinc-400 italic"
                >
                  {t('noProposals')}
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => (
                <TableRow
                  key={p.id}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                >
                  <TableCell className="py-5 pl-6 font-bold">
                    <Link
                      href={`/dashboard/professor/projects/${p.id}`}
                      className="block text-zinc-900 transition-colors hover:text-purple-600 dark:text-zinc-100 dark:hover:text-purple-400"
                    >
                      <span className="block text-sm font-black tracking-tight uppercase">
                        {p.name}
                      </span>
                      <span className="mt-0.5 block max-w-sm truncate text-[10px] font-medium text-zinc-400">
                        {p.description || t('noDescription')}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-5">
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="px-4 py-5 text-center">
                    <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                      {p.teamsCount} / {p.maxGroups}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3 shrink-0 text-zinc-400" />
                        {t('start')}{' '}
                        {p.dateStart ? p.dateStart.split('-').reverse().join('/') : 'TBD'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="size-3 shrink-0 text-zinc-400" />
                        {t('end')} {p.dateEnd ? p.dateEnd.split('-').reverse().join('/') : 'TBD'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-5 text-left">
                    <Link
                      href={`/dashboard/professor/projects/${p.id}`}
                      className="inline-flex h-9 items-center justify-center gap-1 bg-zinc-900 px-3.5 text-[10px] font-black tracking-wider text-white uppercase transition-all hover:bg-purple-600 hover:text-white active:scale-[0.97] dark:bg-zinc-100 dark:text-black dark:hover:bg-purple-700 dark:hover:text-white"
                    >
                      {t('manage')}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}
