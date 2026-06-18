'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteTeacher } from '../actions';
import { toast } from 'sonner';

/**
 * Action button initiating confirmation dialogue and deletion processes for a professor.
 */
export function DeleteTeacherButton({
  teacherId,
  teacherName,
}: {
  teacherId: string;
  teacherName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to remove ${teacherName}?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteTeacher(teacherId);
        toast.success(`Teacher ${teacherName} removed successfully.`);
      } catch {
        toast.error('Failed to remove teacher.');
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}
