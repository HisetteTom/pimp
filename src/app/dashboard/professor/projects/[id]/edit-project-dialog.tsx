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
import { updateProject, getProjectFormDropdowns } from '../../actions';
import { Loader2, Edit2 } from 'lucide-react';
import { dialogReducer } from '../../_components/project-dialog-types';
import { TargetingSection } from '../../_components/targeting-section';
import { ProjectFormFields } from '../../_components/project-form-fields';
import { useTranslations } from 'next-intl';

interface EditProjectDialogProps {
  projectData: {
    id: number;
    name: string;
    description: string | null;
    dateStart: string | null;
    dateEnd: string | null;
    maxGroups: number;
    maxMembersPerGroup: number;
    targetPromos: string[];
    targetUsers: string[];
    coTeachers: string[];
    juries: string[];
    showEvaluationGrid: boolean;
  };
}

type FormState = {
  name: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  maxGroups: string;
  maxMembersPerGroup: string;
  showEvaluationGrid: boolean;
};

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: string | boolean }
  | { type: 'RESET'; payload: FormState };

/**
 * Reducer function for managing local project form input state.
 */
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return action.payload;
    default:
      return state;
  }
}

/**
 * A dialog component that allows professors to modify existing project settings,
 * including details, targeting promos/users, co-teachers, and evaluation juries.
 */
export function EditProjectDialog({ projectData }: EditProjectDialogProps) {
  const t = useTranslations('ProfessorEditDialog');
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const initialFormState: FormState = {
    name: projectData.name,
    description: projectData.description || '',
    dateStart: projectData.dateStart || '',
    dateEnd: projectData.dateEnd || '',
    maxGroups: projectData.maxGroups.toString(),
    maxMembersPerGroup: projectData.maxMembersPerGroup.toString(),
    showEvaluationGrid: projectData.showEvaluationGrid || false,
  };

  const initialDialogState = {
    students: [],
    professors: [],
    juriesList: [],
    targetPromos: projectData.targetPromos || [],
    targetUsers: projectData.targetUsers || [],
    coTeachers: projectData.coTeachers || [],
    juries: projectData.juries || [],
    studentSearch: '',
    profSearch: '',
    jurySearch: '',
    checkpoints: [],
  };

  const [formState, dispatchForm] = useReducer(formReducer, initialFormState);
  const [state, dispatch] = useReducer(dialogReducer, initialDialogState);

  // Directly fetch dropdowns when opening the dialog
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reload current project values into state to ensure freshness
      dispatchForm({
        type: 'RESET',
        payload: {
          name: projectData.name,
          description: projectData.description || '',
          dateStart: projectData.dateStart || '',
          dateEnd: projectData.dateEnd || '',
          maxGroups: projectData.maxGroups.toString(),
          maxMembersPerGroup: projectData.maxMembersPerGroup.toString(),
          showEvaluationGrid: projectData.showEvaluationGrid || false,
        },
      });
      dispatch({ type: 'SET_TARGET_PROMOS', promos: projectData.targetPromos || [] });
      dispatch({ type: 'SET_TARGET_USERS', users: projectData.targetUsers || [] });
      dispatch({ type: 'SET_CO_TEACHERS', teachers: projectData.coTeachers || [] });
      dispatch({ type: 'SET_JURIES', juries: projectData.juries || [] });

      getProjectFormDropdowns()
        .then(({ students, professors, juries }) => {
          dispatch({ type: 'SET_DROPDOWNS', students, professors, juries });
        })
        .catch(console.error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name.trim()) {
      toast.error(t('nameRequired'));
      return;
    }

    startTransition(async () => {
      try {
        await updateProject(projectData.id, {
          name: formState.name,
          description: formState.description,
          dateStart: formState.dateStart || undefined,
          dateEnd: formState.dateEnd || undefined,
          maxGroups: parseInt(formState.maxGroups) || 8,
          maxMembersPerGroup: parseInt(formState.maxMembersPerGroup) || 5,
          targetPromos: state.targetPromos,
          targetUsers: state.targetUsers,
          coTeachers: state.coTeachers,
          juries: state.juries,
          showEvaluationGrid: formState.showEvaluationGrid,
        });

        toast.success(t('updateSuccess'));
        setIsOpen(false);
        refresh();
      } catch (err) {
        toast.error(t('updateError'));
        console.error(err);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="unstyled"
          className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 border-transparent bg-zinc-900 px-3.5 text-[10px] font-black tracking-wider text-white uppercase transition-all hover:bg-purple-600 hover:text-white active:scale-[0.97] dark:bg-zinc-100 dark:text-black dark:hover:bg-purple-700 dark:hover:text-white"
        >
          {t('trigger')}
          <Edit2 className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card max-h-[90vh] overflow-y-auto rounded-none border-2 border-zinc-200 p-6 shadow-2xl sm:max-w-[550px] dark:border-zinc-800">
        <DialogHeader className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <DialogTitle className="pt-2 text-2xl font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
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
            juries={state.juries}
            setJuries={(juries) => dispatch({ type: 'SET_JURIES', juries })}
            students={state.students}
            professors={state.professors}
            juriesList={state.juriesList}
            studentSearch={state.studentSearch}
            setStudentSearch={(search) => dispatch({ type: 'SET_STUDENT_SEARCH', search })}
            profSearch={state.profSearch}
            setProfSearch={(search) => dispatch({ type: 'SET_PROF_SEARCH', search })}
            jurySearch={state.jurySearch}
            setJurySearch={(search) => dispatch({ type: 'SET_JURY_SEARCH', search })}
            isPending={isPending}
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
                  {t('saving')}
                </>
              ) : (
                t('saveChanges')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
