'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteTeam } from '@/app/dashboard/professor/actions';
import { toast } from 'sonner';

/**
 * A client-side button component that handles team deletion.
 * Prompts the user with a confirmation dialog and invokes the server action
 * to remove the team and its associated records.
 */
export function DeleteTeamButton({ teamId, teamName }: { teamId: number; teamName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        `Are you sure you want to delete the team "${teamName}"? This action is irreversible and will delete all tasks, comments, and deliverables.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteTeam(teamId);
        toast.success(`Team "${teamName}" deleted successfully.`);
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete team.');
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleDelete}
      disabled={isPending}
      className="flex h-12 w-full items-center justify-center gap-1 rounded-none border-red-200 text-sm font-black tracking-wider text-red-600 uppercase transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      Delete Team
    </Button>
  );
}
