'use client';

import { useState, useReducer, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createProject } from './actions';
import { Loader2, Plus, Calendar, Users, FileText } from 'lucide-react';
import { CheckpointsEditor } from './_components/checkpoints-editor';

const initialFormState = {
  name: '',
  description: '',
  dateStart: '',
  dateEnd: '',
  maxGroups: '8',
  maxMembersPerGroup: '5',
};

type FormAction = { type: 'SET_FIELD'; field: string; value: string } | { type: 'RESET' };

function formReducer(state: typeof initialFormState, action: FormAction) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
}

export function CreateProjectDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [checkpoints, setCheckpoints] = useState<{ id: string; title: string; dueDate: string }[]>(
    [],
  );

  const addCheckpoint = () => {
    setCheckpoints((prev) => [...prev, { id: crypto.randomUUID(), title: '', dueDate: '' }]);
  };

  const removeCheckpoint = (id: string) => {
    setCheckpoints((prev) => prev.filter((cp) => cp.id !== id));
  };

  const updateCheckpointField = (id: string, field: 'title' | 'dueDate', value: string) => {
    setCheckpoints((prev) => prev.map((cp) => (cp.id === id ? { ...cp, [field]: value } : cp)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    startTransition(async () => {
      try {
        await createProject({
          name: formState.name,
          description: formState.description,
          dateStart: formState.dateStart || undefined,
          dateEnd: formState.dateEnd || undefined,
          maxGroups: parseInt(formState.maxGroups) || 8,
          maxMembersPerGroup: parseInt(formState.maxMembersPerGroup) || 5,
          checkpoints: checkpoints.reduce<{ title: string; dueDate: string }[]>((acc, cp) => {
            if (cp.title.trim() !== '' && cp.dueDate !== '') {
              acc.push({ title: cp.title, dueDate: cp.dueDate });
            }
            return acc;
          }, []),
        });

        toast.success('Project created successfully');
        setIsOpen(false);
        dispatch({ type: 'RESET' });
        setCheckpoints([]);
        refresh();
      } catch (err) {
        toast.error('Failed to create project');
        console.error(err);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="unstyled"
          className="flex h-11 cursor-pointer items-center gap-2 border-transparent bg-purple-600 px-6 font-black tracking-wider text-white uppercase shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] transition-all hover:bg-purple-700 hover:text-white focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:hover:bg-purple-700"
        >
          <Plus className="size-4" />
          Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card max-h-[90vh] overflow-y-auto rounded-none border-2 border-zinc-200 p-6 shadow-2xl sm:max-w-[550px] dark:border-zinc-800">
        <DialogHeader className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
            Create Project Proposal
          </DialogTitle>
          <DialogDescription className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Submit a new project that students can enroll in.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
            >
              Project Name <span className="text-purple-500">*</span>
            </Label>
            <div className="relative">
              <FileText className="absolute top-3 left-3 size-4 text-zinc-400" />
              <Input
                id="name"
                type="text"
                className="h-11 rounded-none border-2 border-zinc-200 pl-10 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
                value={formState.name}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })
                }
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
            >
              Description
            </Label>
            <Textarea
              id="description"
              rows={4}
              className="resize-none rounded-none border-2 border-zinc-200 p-3 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
              value={formState.description}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })
              }
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="dateStart"
                className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
              >
                Start Date
              </Label>
              <div className="relative">
                <Calendar className="absolute top-3 left-3 size-4 text-zinc-400" />
                <Input
                  id="dateStart"
                  type="date"
                  className="h-11 rounded-none border-2 border-zinc-200 pl-10 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
                  value={formState.dateStart}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'dateStart', value: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="dateEnd"
                className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
              >
                End Date
              </Label>
              <div className="relative">
                <Calendar className="absolute top-3 left-3 size-4 text-zinc-400" />
                <Input
                  id="dateEnd"
                  type="date"
                  className="h-11 rounded-none border-2 border-zinc-200 pl-10 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
                  value={formState.dateEnd}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'dateEnd', value: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="maxGroups"
                className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
              >
                Max Teams
              </Label>
              <div className="relative">
                <Users className="absolute top-3 left-3 size-4 text-zinc-400" />
                <Input
                  id="maxGroups"
                  type="number"
                  min="1"
                  max="50"
                  className="h-11 rounded-none border-2 border-zinc-200 pl-10 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
                  value={formState.maxGroups}
                  onChange={(e) =>
                    dispatch({ type: 'SET_FIELD', field: 'maxGroups', value: e.target.value })
                  }
                  required
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="maxMembersPerGroup"
                className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
              >
                Max Members/Team
              </Label>
              <div className="relative">
                <Users className="absolute top-3 left-3 size-4 text-zinc-400" />
                <Input
                  id="maxMembersPerGroup"
                  type="number"
                  min="1"
                  max="20"
                  className="h-11 rounded-none border-2 border-zinc-200 pl-10 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
                  value={formState.maxMembersPerGroup}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'maxMembersPerGroup',
                      value: e.target.value,
                    })
                  }
                  required
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <CheckpointsEditor
            checkpoints={checkpoints}
            isPending={isPending}
            onAdd={addCheckpoint}
            onRemove={removeCheckpoint}
            onUpdate={updateCheckpointField}
          />

          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <DialogClose asChild>
              <Button
                type="button"
                variant="unstyled"
                className="flex h-11 cursor-pointer items-center justify-center rounded-none border-2 border-zinc-200 px-5 font-bold tracking-wider uppercase hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                disabled={isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="unstyled"
              className="flex h-11 cursor-pointer items-center gap-2 rounded-none border-transparent bg-purple-600 px-6 font-black tracking-wider text-white uppercase shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] hover:bg-purple-700 hover:text-white focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:hover:bg-purple-700"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
