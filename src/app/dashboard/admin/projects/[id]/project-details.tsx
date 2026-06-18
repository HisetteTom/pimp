import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '../../../professor/_components/status-badge';
import { School } from 'lucide-react';
import { StudentTeamSelector, UnenrollButton } from './project-controls';
import { useTranslations } from 'next-intl';

interface ProjectData {
  id: number;
  name: string;
  description: string | null;
  status: string;
  targetPromos: string[];
  maxMembersPerGroup: number;
}

interface TeamOption {
  id: number;
  name: string;
}

interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  promo: string;
  teamId: number | null;
  teamName: string | null;
}

// Project Header Card Component
/**
 * Header card for displaying key metadata of a project.
 */
export function ProjectHeaderCard({
  currentProject,
  professorName,
}: {
  currentProject: ProjectData;
  professorName: string;
}) {
  const t = useTranslations('AdminProjectDetails');

  return (
    <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:border-zinc-800">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-zinc-100 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
                {currentProject.name}
              </h1>
              <StatusBadge status={currentProject.status} />
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold tracking-widest text-zinc-400 uppercase">
              <School className="size-3.5" /> {t('ledBy', { name: professorName })}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentProject.targetPromos.map((p) => (
              <Badge
                key={p}
                variant="outline"
                className="rounded-none border-purple-500/20 bg-purple-500/5 text-[9px] font-black tracking-wider text-purple-600"
              >
                {p}
              </Badge>
            ))}
          </div>
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {currentProject.description || t('noDescription')}
        </p>
      </CardContent>
    </Card>
  );
}

// Enrolled Students Table Component
/**
 * Renders list of enrolled students in a project.
 */
export function EnrolledStudentsTable({
  enrolledStudents,
  teams,
  projectId,
}: {
  enrolledStudents: EnrolledStudent[];
  teams: TeamOption[];
  projectId: number;
}) {
  const t = useTranslations('AdminProjectDetails');

  return (
    <Card className="bg-card overflow-hidden rounded-none border-2 border-zinc-200 dark:border-zinc-800">
      <Table>
        <TableHeader className="border-b-2 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <TableRow className="hover:bg-transparent">
            <TableHead className="py-4 pl-6 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
              {t('colStudent')}
            </TableHead>
            <TableHead className="p-4 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
              {t('colPromo')}
            </TableHead>
            <TableHead className="p-4 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
              {t('colTeamAssignment')}
            </TableHead>
            <TableHead className="p-4 text-center text-[10px] font-black tracking-wider text-zinc-500 uppercase">
              {t('colUnenroll')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrolledStudents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center font-medium text-zinc-400 italic">
                {t('noStudents')}
              </TableCell>
            </TableRow>
          ) : (
            enrolledStudents.map((student) => (
              <TableRow
                key={student.id}
                className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
              >
                <TableCell className="flex items-center gap-3 py-4 pl-6 font-bold">
                  <div className="flex size-7 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-[10px] font-black text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
                      {student.name}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400">{student.email}</span>
                  </div>
                </TableCell>
                <TableCell className="p-4 text-xs font-black text-zinc-500 uppercase">
                  {student.promo}
                </TableCell>
                <TableCell className="p-4">
                  <StudentTeamSelector
                    studentId={student.id}
                    projectId={projectId}
                    currentTeamId={student.teamId}
                    teams={teams}
                  />
                </TableCell>
                <TableCell className="p-4 text-center">
                  <UnenrollButton
                    studentId={student.id}
                    studentName={student.name}
                    projectId={projectId}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

// Teams Status List Component
/**
 * Renders status lists of teams assigned to a project.
 */
export function TeamsStatusList({
  teams,
  maxMembersPerGroup,
  teamMemberCounts,
  membersByTeam,
}: {
  teams: TeamOption[];
  maxMembersPerGroup: number;
  teamMemberCounts: Map<number, number>;
  membersByTeam: Map<number, EnrolledStudent[]>;
}) {
  const t = useTranslations('AdminProjectDetails');

  return (
    <div className="space-y-4">
      {teams.length === 0 ? (
        <div className="border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:border-zinc-800 dark:bg-zinc-900">
          {t('noTeams')}
        </div>
      ) : (
        teams.map((teamItem) => {
          const size = teamMemberCounts.get(teamItem.id) || 0;
          const members = membersByTeam.get(teamItem.id) || [];
          const isFull = size >= maxMembersPerGroup;

          return (
            <Card
              key={teamItem.id}
              className={`rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.03)] ${
                isFull
                  ? 'border-emerald-500/30 bg-emerald-500/[0.01]'
                  : 'bg-card border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                <span className="text-xs font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
                  {teamItem.name}
                </span>
                <Badge
                  variant="outline"
                  className={`rounded-none text-[9px] font-black tracking-widest ${
                    isFull
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950'
                      : 'border-zinc-300 text-zinc-500'
                  }`}
                >
                  {t('membersCount', { count: size, max: maxMembersPerGroup })}
                </Badge>
              </CardHeader>
              <CardContent className="pt-3">
                {members.length === 0 ? (
                  <p className="text-[10px] font-bold text-zinc-400 uppercase italic">
                    {t('noMembers')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-xs">
                        <span className="max-w-[150px] truncate font-semibold text-zinc-700 uppercase dark:text-zinc-300">
                          {m.name}
                        </span>
                        <span className="text-[9px] font-black text-zinc-400">{m.promo}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
