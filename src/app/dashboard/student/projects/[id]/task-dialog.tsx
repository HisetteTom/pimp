'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createTask } from '../../actions';
import { toast } from 'sonner';
import { Plus, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TaskDialogProps {
  projectId: number;
  teamId: number;
  members: { id: string; name: string }[];
  trigger?: React.ReactNode;
  defaultStatus?: string;
}

/**
 * Renders a task creator modal.
 * Captures inputs for task titles, descriptions, priorities, deadlines,
 * and select assignees to post new task objects via the createTask server action.
 */
export function TaskDialog({
  projectId,
  teamId,
  members,
  trigger,
  defaultStatus,
}: TaskDialogProps) {
  const t = useTranslations('TaskDialog');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const deadlineStr = formData.get('deadline') as string;

    const assigneeId = selectedAssignees.length > 0 ? selectedAssignees[0] : undefined;
    const assignees = selectedAssignees.join(',');

    try {
      await createTask({
        name,
        description,
        priority,
        status: defaultStatus,
        deadline: deadlineStr ? new Date(deadlineStr) : undefined,
        teamId,
        assigneeId,
        assignees: assignees || undefined,
        projectId,
      });
      toast.success(t('taskCreatedToast'));
      setOpen(false);
      setSelectedAssignees([]);
      setLoading(false);
    } catch {
      toast.error(t('failedCreateToast'));
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSelectedAssignees([]);
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button className="text-xs font-semibold tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)]">
            <Plus className="mr-2 size-4" />
            {t('addTask')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="tracking-tighter uppercase">{t('newTeamTask')}</DialogTitle>
            <DialogDescription>{t('descriptionSub')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-bold text-zinc-400 uppercase">
                {t('taskName')}
              </Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-xs font-bold text-zinc-400 uppercase">
                {t('description')}
              </Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority" className="text-xs font-bold text-zinc-400 uppercase">
                  {t('priority')}
                </Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
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
                <Label htmlFor="deadline" className="text-xs font-bold text-zinc-400 uppercase">
                  {t('deadline')}
                </Label>
                <Input id="deadline" name="deadline" type="date" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold text-zinc-400 uppercase">
                {t('assignMembers')}
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
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full font-bold uppercase">
              {loading ? t('creating') : t('createTask')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
