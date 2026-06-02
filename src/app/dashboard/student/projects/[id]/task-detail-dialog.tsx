'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateTask, deleteTask } from '../../actions';
import { toast } from 'sonner';
import { Trash2, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Task {
  id: number;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: Date | string | null;
  assigneeId: string | null;
  assignees?: string | null;
}

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: { id: string; name: string }[];
  projectId: number;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  members,
  projectId,
}: TaskDetailDialogProps) {
  const t = useTranslations('TaskDetailDialog');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(() => {
    if (!task) return [];
    if (task.assignees) return task.assignees.split(',').filter(Boolean);
    if (task.assigneeId) return [task.assigneeId];
    return [];
  });

  if (!task) return null;

  // Format date to YYYY-MM-DD for input type="date"
  const formattedDeadline = task.deadline
    ? new Date(task.deadline).toISOString().split('T')[0]
    : '';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!task) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const deadlineStr = formData.get('deadline') as string;

    const assigneeId = selectedAssignees.length > 0 ? selectedAssignees[0] : null;
    const assignees = selectedAssignees.join(',');

    try {
      await updateTask({
        id: task.id,
        name,
        description: description || null,
        priority,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
        assigneeId,
        assignees: assignees || null,
        projectId,
      });
      toast.success(t('updatedToast'));
      onOpenChange(false);
      setLoading(false);
    } catch {
      toast.error(t('failedUpdateToast'));
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm(t('deleteConfirm'))) return;
    setDeleting(true);

    try {
      await deleteTask(task.id, projectId);
      toast.success(t('deletedToast'));
      onOpenChange(false);
      setDeleting(false);
    } catch {
      toast.error(t('failedDeleteToast'));
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tighter uppercase">
              {t('title')}
            </DialogTitle>
            <DialogDescription>{t('descriptionSub')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="detail-name" className="text-xs font-bold text-zinc-400 uppercase">
                {t('taskName')}
              </Label>
              <Input
                id="detail-name"
                name="name"
                defaultValue={task.name}
                required
                className="font-semibold"
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="detail-description"
                className="text-xs font-bold text-zinc-400 uppercase"
              >
                {t('description')}
              </Label>
              <Textarea
                id="detail-description"
                name="description"
                defaultValue={task.description || ''}
                rows={3}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="detail-priority"
                  className="text-xs font-bold text-zinc-400 uppercase"
                >
                  {t('priority')}
                </Label>
                <Select name="priority" defaultValue={task.priority}>
                  <SelectTrigger id="detail-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('low')}</SelectItem>
                    <SelectItem value="medium">{t('medium')}</SelectItem>
                    <SelectItem value="high">{t('high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="detail-deadline"
                  className="text-xs font-bold text-zinc-400 uppercase"
                >
                  {t('deadline')}
                </Label>
                <Input
                  id="detail-deadline"
                  name="deadline"
                  type="date"
                  defaultValue={formattedDeadline}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold text-zinc-400 uppercase">
                {t('assignedMembers')}
              </Label>
              <div className="max-h-[160px] space-y-1 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
                {members.map((member) => {
                  const isAssigned = selectedAssignees.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setSelectedAssignees((prev) =>
                          prev.includes(member.id)
                            ? prev.filter((id) => id !== member.id)
                            : [...prev, member.id],
                        );
                      }}
                      className={`group flex w-full items-center justify-between rounded p-2 text-left transition-all ${
                        isAssigned
                          ? 'bg-primary/10 text-primary border-primary/20 border-2'
                          : 'border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold uppercase transition-all ${
                            isAssigned
                              ? 'bg-primary text-primary-foreground scale-105'
                              : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {member.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <span className="text-xs font-semibold">{member.name}</span>
                      </div>
                      <div
                        className={`flex size-4 items-center justify-center rounded border transition-all ${
                          isAssigned
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-zinc-300 group-hover:border-zinc-400 dark:border-zinc-600'
                        }`}
                      >
                        {isAssigned && <Check className="size-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
                {members.length === 0 && (
                  <p className="py-4 text-center text-xs text-zinc-400 italic">{t('noMembers')}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="text-destructive hover:bg-destructive/10 p-2 text-xs font-bold tracking-wider uppercase"
            >
              <Trash2 className="mr-1.5 size-4" />
              {t('delete')}
            </Button>
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || deleting}
                className="text-xs font-bold tracking-wider uppercase"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading || deleting}
                className="text-xs font-bold tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)]"
              >
                {loading ? t('saving') : t('saveChanges')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
