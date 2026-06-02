'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTeam, enrollStudent, unenrollStudent, assignStudentToTeam } from '../../actions';
import { Loader2, Plus, UserPlus, UserMinus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TeamOption {
  id: number;
  name: string;
}

interface StudentOption {
  id: string;
  name: string;
  username: string | null;
  promo: string | null;
}

// 1. Team Selector Dropdown next to each student
export function StudentTeamSelector({
  studentId,
  projectId,
  currentTeamId,
  teams,
}: {
  studentId: string;
  projectId: number;
  currentTeamId: number | null;
  teams: TeamOption[];
}) {
  const t = useTranslations('AdminProjectControls');
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const handleValueChange = (value: string) => {
    const teamId = value === 'none' ? null : parseInt(value);

    startTransition(async () => {
      try {
        await assignStudentToTeam(projectId, studentId, teamId);
        toast.success(t('teamUpdateSuccess'));
        refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : t('teamUpdateError');
        toast.error(message);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isPending && <Loader2 className="size-3.5 shrink-0 animate-spin text-purple-500" />}
      <Select
        disabled={isPending}
        value={currentTeamId ? currentTeamId.toString() : 'none'}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="h-8 w-[180px] rounded-none border border-zinc-200 text-xs focus:border-purple-600 focus:ring-purple-600 dark:border-zinc-800">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          <SelectItem value="none" className="text-xs">
            {t('noTeamUnassigned')}
          </SelectItem>
          {teams.map((teamItem) => (
            <SelectItem key={teamItem.id} value={teamItem.id.toString()} className="text-xs">
              {teamItem.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// 2. Force Enroll Student Form
export function EnrollmentTool({
  projectId,
  unenrolledStudents,
}: {
  projectId: number;
  unenrolledStudents: StudentOption[];
}) {
  const t = useTranslations('AdminProjectControls');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error(t('selectStudentError'));
      return;
    }

    startTransition(async () => {
      try {
        await enrollStudent(projectId, selectedStudent);
        toast.success(t('enrollSuccess'));
        setSelectedStudent('');
        refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : t('enrollError');
        toast.error(message);
      }
    });
  };

  return (
    <form
      onSubmit={handleEnroll}
      className="flex flex-col items-end gap-3 border-2 border-zinc-200 bg-zinc-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)] sm:flex-row dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="w-full flex-1 space-y-1.5">
        <label
          htmlFor="student-select"
          className="text-[10px] font-black tracking-widest text-zinc-400 uppercase"
        >
          {t('forceEnrollStudent')}
        </label>
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger
            id="student-select"
            className="h-10 w-full rounded-none border-2 border-zinc-200 bg-white focus:border-purple-600 focus:ring-purple-600 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <SelectValue placeholder={t('selectStudentPlaceholder')} />
          </SelectTrigger>
          <SelectContent className="max-h-72 rounded-none">
            {unenrolledStudents.length === 0 ? (
              <SelectItem value="none" disabled className="text-xs">
                {t('noUnenrolledStudents')}
              </SelectItem>
            ) : (
              unenrolledStudents.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs">
                  {s.name} (@{s.username || 'n/a'}) - {s.promo || 'No Promo'}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        disabled={isPending || !selectedStudent}
        className="h-10 w-full shrink-0 justify-center rounded-none bg-zinc-900 px-5 text-center text-xs font-black tracking-wider text-white uppercase shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] hover:bg-purple-600 active:translate-x-[2px] active:translate-y-[2px] active:scale-[0.98] active:shadow-none sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 size-4" />
        )}
        {t('btnEnroll')}
      </Button>
    </form>
  );
}

// 3. Create Team Tool
export function CreateTeamTool({ projectId }: { projectId: number }) {
  const t = useTranslations('AdminProjectControls');
  const [teamName, setTeamName] = useState('');
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error(t('teamNameEmptyError'));
      return;
    }

    startTransition(async () => {
      try {
        await createTeam(projectId, teamName);
        toast.success(t('teamCreateSuccess', { name: teamName }));
        setTeamName('');
        refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : t('teamCreateError');
        toast.error(message);
      }
    });
  };

  return (
    <form
      onSubmit={handleCreate}
      className="flex flex-col items-end gap-3 border-2 border-zinc-200 bg-zinc-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)] sm:flex-row dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="w-full flex-1 space-y-1.5">
        <label
          htmlFor="team-name-input"
          className="text-[10px] font-black tracking-widest text-zinc-400 uppercase"
        >
          {t('createNewTeam')}
        </label>
        <Input
          id="team-name-input"
          placeholder={t('teamNamePlaceholder')}
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="h-10 w-full rounded-none border-2 border-zinc-200 bg-white focus-visible:border-purple-600 focus-visible:ring-purple-600 dark:border-zinc-800 dark:bg-zinc-950"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={isPending || !teamName.trim()}
        className="h-10 w-full shrink-0 justify-center rounded-none bg-zinc-900 px-5 text-center text-xs font-black tracking-wider text-white uppercase shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] hover:bg-purple-600 active:translate-x-[2px] active:translate-y-[2px] active:scale-[0.98] active:shadow-none sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Plus className="mr-2 size-4" />
        )}
        {t('btnCreateTeam')}
      </Button>
    </form>
  );
}

// 4. Kick / Unenroll Button
export function UnenrollButton({
  studentId,
  studentName,
  projectId,
}: {
  studentId: string;
  studentName: string;
  projectId: number;
}) {
  const t = useTranslations('AdminProjectControls');
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const handleUnenroll = () => {
    if (confirm(t('confirmUnenroll', { name: studentName }))) {
      startTransition(async () => {
        try {
          await unenrollStudent(projectId, studentId);
          toast.success(t('unenrollSuccess'));
          refresh();
        } catch (err) {
          const message = err instanceof Error ? err.message : t('unenrollError');
          toast.error(message);
        }
      });
    }
  };

  return (
    <Button
      variant="unstyled"
      onClick={handleUnenroll}
      disabled={isPending}
      className="inline-flex size-8 items-center justify-center border border-zinc-200 text-zinc-700 transition-colors hover:border-red-500 hover:bg-red-500 hover:text-white dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-red-600 dark:hover:text-white"
      title={t('tooltipUnenroll')}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <UserMinus className="size-4" />}
    </Button>
  );
}
