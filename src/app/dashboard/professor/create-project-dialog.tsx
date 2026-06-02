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
import { createProject, getProjectFormDropdowns } from './actions';
import { Loader2, Plus } from 'lucide-react';
import { CheckpointsEditor } from './_components/checkpoints-editor';
import { dialogReducer, initialDialogState } from './_components/project-dialog-types';
import { TargetingSection } from './_components/targeting-section';
import { ProjectFormFields } from './_components/project-form-fields';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('ProfessorCreateDialog');
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();
  const [formState, dispatchForm] = useReducer(formReducer, initialFormState);
  const [state, dispatch] = useReducer(dialogReducer, initialDialogState);

  // Directly fetch dropdowns when opening the dialog (avoiding useEffect)
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      getProjectFormDropdowns()
        .then(({ students, professors }) => {
          dispatch({ type: 'SET_DROPDOWNS', students, professors });
        })
        .catch(console.error);
    } else {
      dispatch({ type: 'RESET' });
      dispatchForm({ type: 'RESET' });
    }
  };

  const addCheckpoint = () => {
    dispatch({
      type: 'SET_CHECKPOINTS',
      checkpoints: [...state.checkpoints, { id: crypto.randomUUID(), title: '', dueDate: '' }],
    });
  };

  const removeCheckpoint = (id: string) => {
    dispatch({
      type: 'SET_CHECKPOINTS',
      checkpoints: state.checkpoints.filter((cp) => cp.id !== id),
    });
  };

  const updateCheckpointField = (id: string, field: 'title' | 'dueDate', value: string) => {
    dispatch({
      type: 'SET_CHECKPOINTS',
      checkpoints: state.checkpoints.map((cp) => (cp.id === id ? { ...cp, [field]: value } : cp)),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name.trim()) {
      toast.error(t('nameRequired'));
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
          checkpoints: state.checkpoints.reduce<{ title: string; dueDate: string }[]>((acc, cp) => {
            if (cp.title.trim() !== '' && cp.dueDate !== '') {
              acc.push({ title: cp.title, dueDate: cp.dueDate });
            }
            return acc;
          }, []),
          targetPromos: state.targetPromos,
          targetUsers: state.targetUsers,
          coTeachers: state.coTeachers,
        });

        toast.success(t('createSuccess'));
        setIsOpen(false);
        dispatchForm({ type: 'RESET' });
        dispatch({ type: 'RESET' });
        refresh();
      } catch (err) {
        toast.error(t('createError'));
        console.error(err);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="unstyled"
          className="flex h-11 cursor-pointer items-center gap-2 border-transparent bg-purple-600 px-6 font-black tracking-wider text-white uppercase shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] transition-all hover:bg-purple-700 hover:text-white focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:hover:bg-purple-700"
        >
          <Plus className="size-4" />
          {t('trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card max-h-[90vh] overflow-y-auto rounded-none border-2 border-zinc-200 p-6 shadow-2xl sm:max-w-[550px] dark:border-zinc-800">
        <DialogHeader className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <ProjectFormFields
            formState={formState}
            onChange={(field, value) => dispatchForm({ type: 'SET_FIELD', field, value })}
            isPending={isPending}
          />

          {/* Extracted targeting section */}
          <TargetingSection
            targetPromos={state.targetPromos}
            setTargetPromos={(promos) => dispatch({ type: 'SET_TARGET_PROMOS', promos })}
            targetUsers={state.targetUsers}
            setTargetUsers={(users) => dispatch({ type: 'SET_TARGET_USERS', users })}
            coTeachers={state.coTeachers}
            setCoTeachers={(teachers) => dispatch({ type: 'SET_CO_TEACHERS', teachers })}
            students={state.students}
            professors={state.professors}
            studentSearch={state.studentSearch}
            setStudentSearch={(search) => dispatch({ type: 'SET_STUDENT_SEARCH', search })}
            profSearch={state.profSearch}
            setProfSearch={(search) => dispatch({ type: 'SET_PROF_SEARCH', search })}
            isPending={isPending}
          />

          <CheckpointsEditor
            checkpoints={state.checkpoints}
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
                {t('cancel')}
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
                  {t('submitting')}
                </>
              ) : (
                t('submit')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
