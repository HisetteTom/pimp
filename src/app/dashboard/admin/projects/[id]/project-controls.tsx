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
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const handleValueChange = (value: string) => {
    const teamId = value === 'none' ? null : parseInt(value);

    startTransition(async () => {
      try {
        await assignStudentToTeam(projectId, studentId, teamId);
        toast.success('Student team updated successfully');
        refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update team';
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
            No Team (Unassigned)
          </SelectItem>
          {teams.map((t) => (
            <SelectItem key={t.id} value={t.id.toString()} className="text-xs">
              {t.name}
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
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    startTransition(async () => {
      try {
        await enrollStudent(projectId, selectedStudent);
        toast.success('Student enrolled successfully');
        setSelectedStudent('');
        refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to enroll student';
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
          Force Enroll Student
        </label>
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger
            id="student-select"
            className="h-10 w-full rounded-none border-2 border-zinc-200 bg-white focus:border-purple-600 focus:ring-purple-600 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <SelectValue placeholder="Select student to add..." />
          </SelectTrigger>
          <SelectContent className="max-h-72 rounded-none">
            {unenrolledStudents.length === 0 ? (
              <SelectItem value="none" disabled className="text-xs">
                No unenrolled students found
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
        Enroll Student
      </Button>
    </form>
  );
}

// 3. Create Team Tool
export function CreateTeamTool({ projectId }: { projectId: number }) {
  const [teamName, setTeamName] = useState('');
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error('Team name cannot be empty');
      return;
    }

    startTransition(async () => {
      try {
        await createTeam(projectId, teamName);
        toast.success(`Team "${teamName}" created successfully`);
        setTeamName('');
        refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create team';
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
          Create New Team
        </label>
        <Input
          id="team-name-input"
          placeholder="Enter team name (e.g. Group 9)..."
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
        Create Team
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
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const handleUnenroll = () => {
    if (
      confirm(
        `Are you sure you want to remove ${studentName} from this project? This will also clear their team assignment.`,
      )
    ) {
      startTransition(async () => {
        try {
          await unenrollStudent(projectId, studentId);
          toast.success('Student unenrolled successfully');
          refresh();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to unenroll student';
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
      title="Unenroll student"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <UserMinus className="size-4" />}
    </Button>
  );
}
