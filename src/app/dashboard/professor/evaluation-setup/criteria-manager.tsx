'use client';

import { useTransition, useReducer, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, ClipboardCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createCriterion, updateCriterion, deleteCriterion } from '../evaluation-actions';
import { ProjectsSidebar } from './projects-sidebar';
import { CriterionBuilderCard } from './criterion-builder-card';
import { CriterionRow } from './criterion-row';
import { useTranslations } from 'next-intl';

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
}

interface Criterion {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
  maxPoints: number;
}

interface CriteriaManagerProps {
  projects: Project[];
  initialCriteria: Criterion[];
}

interface State {
  selectedProjectId: number | null;
  criteria: Criterion[];
  isCreating: boolean;
  newName: string;
  newDescription: string;
  newMaxPoints: number;
  editingId: number | null;
  editName: string;
  editDescription: string;
  editMaxPoints: number;
}

type Action =
  | { type: 'SET_SELECTED_PROJECT'; projectId: number | null }
  | { type: 'SET_CRITERIA'; criteria: Criterion[] }
  | { type: 'START_CREATE' }
  | { type: 'CANCEL_CREATE' }
  | { type: 'SET_NEW_NAME'; name: string }
  | { type: 'SET_NEW_DESCRIPTION'; description: string }
  | { type: 'SET_NEW_MAX_POINTS'; points: number }
  | { type: 'START_EDIT'; criterion: Criterion }
  | { type: 'CANCEL_EDIT' }
  | { type: 'SET_EDIT_NAME'; name: string }
  | { type: 'SET_EDIT_DESCRIPTION'; description: string }
  | { type: 'SET_EDIT_MAX_POINTS'; points: number }
  | { type: 'ADD_CRITERION'; criterion: Criterion }
  | { type: 'UPDATE_CRITERION'; criterion: Criterion }
  | { type: 'DELETE_CRITERION'; id: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SELECTED_PROJECT':
      return {
        ...state,
        selectedProjectId: action.projectId,
        isCreating: false,
        editingId: null,
      };
    case 'SET_CRITERIA':
      return {
        ...state,
        criteria: action.criteria,
      };
    case 'START_CREATE':
      return {
        ...state,
        isCreating: true,
        editingId: null,
      };
    case 'CANCEL_CREATE':
      return {
        ...state,
        isCreating: false,
      };
    case 'SET_NEW_NAME':
      return { ...state, newName: action.name };
    case 'SET_NEW_DESCRIPTION':
      return { ...state, newDescription: action.description };
    case 'SET_NEW_MAX_POINTS':
      return { ...state, newMaxPoints: action.points };
    case 'START_EDIT':
      return {
        ...state,
        editingId: action.criterion.id,
        editName: action.criterion.name,
        editDescription: action.criterion.description || '',
        editMaxPoints: action.criterion.maxPoints,
        isCreating: false,
      };
    case 'CANCEL_EDIT':
      return {
        ...state,
        editingId: null,
      };
    case 'SET_EDIT_NAME':
      return { ...state, editName: action.name };
    case 'SET_EDIT_DESCRIPTION':
      return { ...state, editDescription: action.description };
    case 'SET_EDIT_MAX_POINTS':
      return { ...state, editMaxPoints: action.points };
    case 'ADD_CRITERION':
      return {
        ...state,
        criteria: [...state.criteria, action.criterion],
        isCreating: false,
        newName: '',
        newDescription: '',
        newMaxPoints: 20,
      };
    case 'UPDATE_CRITERION':
      return {
        ...state,
        criteria: state.criteria.map((c) => (c.id === action.criterion.id ? action.criterion : c)),
        editingId: null,
      };
    case 'DELETE_CRITERION':
      return {
        ...state,
        criteria: state.criteria.filter((c) => c.id !== action.id),
      };
    default:
      return state;
  }
}

export function CriteriaManager({ projects, initialCriteria }: CriteriaManagerProps) {
  const t = useTranslations('ProfessorCriteriaManager');
  const [isPending, startTransition] = useTransition();

  const [state, dispatch] = useReducer(reducer, null, () => ({
    selectedProjectId: projects.length > 0 ? projects[0].id : null,
    criteria: initialCriteria,
    isCreating: false,
    newName: '',
    newDescription: '',
    newMaxPoints: 20,
    editingId: null,
    editName: '',
    editDescription: '',
    editMaxPoints: 20,
  }));

  // Synchronize state with incoming parent prop updates dynamically
  useEffect(() => {
    dispatch({ type: 'SET_CRITERIA', criteria: initialCriteria });
  }, [initialCriteria]);

  const activeProject = projects.find((p) => p.id === state.selectedProjectId);

  // Compute criteria list for selected project inline during render
  const projectCriteria = state.criteria.reduce<Criterion[]>((acc, item) => {
    if (item.projectId === state.selectedProjectId) {
      acc.push(item);
    }
    return acc;
  }, []);

  const handleCreate = () => {
    if (!state.selectedProjectId) return;
    if (!state.newName.trim()) {
      toast.error(t('nameEmptyError'));
      return;
    }
    if (state.newMaxPoints <= 0) {
      toast.error(t('pointsPositiveError'));
      return;
    }

    startTransition(async () => {
      try {
        const newCp = await createCriterion({
          projectId: state.selectedProjectId!,
          name: state.newName.trim(),
          description: state.newDescription.trim() || undefined,
          maxPoints: state.newMaxPoints,
        });

        dispatch({ type: 'ADD_CRITERION', criterion: newCp });
        toast.success(t('addSuccess'));
      } catch {
        toast.error(t('addError'));
      }
    });
  };

  const handleUpdate = (id: number) => {
    if (!state.editName.trim()) {
      toast.error(t('nameEmptyError'));
      return;
    }
    if (state.editMaxPoints <= 0) {
      toast.error(t('pointsPositiveError'));
      return;
    }

    startTransition(async () => {
      try {
        const updated = await updateCriterion({
          id,
          name: state.editName.trim(),
          description: state.editDescription.trim() || undefined,
          maxPoints: state.editMaxPoints,
        });

        dispatch({ type: 'UPDATE_CRITERION', criterion: updated });
        toast.success(t('updateSuccess'));
      } catch {
        toast.error(t('updateError'));
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteCriterion(id);
        dispatch({ type: 'DELETE_CRITERION', id });
        toast.success(t('deleteSuccess'));
      } catch {
        toast.error(t('deleteError'));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <ProjectsSidebar
        projects={projects}
        selectedProjectId={state.selectedProjectId}
        criteria={state.criteria}
        onSelectProject={(id) => dispatch({ type: 'SET_SELECTED_PROJECT', projectId: id })}
      />

      <div className="space-y-6 lg:col-span-8">
        {activeProject ? (
          <div className="space-y-6">
            <div className="bg-card flex flex-col justify-between gap-4 border-2 border-zinc-200 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none sm:flex-row sm:items-center dark:border-zinc-800">
              <div className="space-y-1">
                <span className="text-[9px] font-bold tracking-widest text-purple-600 uppercase dark:text-purple-400">
                  {t('gridSettings')}
                </span>
                <h2 className="text-xl leading-tight font-semibold text-zinc-900 uppercase dark:text-zinc-100">
                  {activeProject.name}
                </h2>
                {activeProject.description && (
                  <p className="line-clamp-2 text-[11px] font-medium text-zinc-500">
                    {activeProject.description}
                  </p>
                )}
              </div>
              <Button
                variant="unstyled"
                onClick={() => dispatch({ type: 'START_CREATE' })}
                disabled={state.isCreating}
                className="flex shrink-0 items-center justify-center gap-2 bg-zinc-900 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Plus className="size-4" />
                {t('addCriterion')}
              </Button>
            </div>

            {state.isCreating && (
              <CriterionBuilderCard
                newName={state.newName}
                newDescription={state.newDescription}
                newMaxPoints={state.newMaxPoints}
                isPending={isPending}
                onNameChange={(val) => dispatch({ type: 'SET_NEW_NAME', name: val })}
                onDescriptionChange={(val) =>
                  dispatch({ type: 'SET_NEW_DESCRIPTION', description: val })
                }
                onMaxPointsChange={(val) => dispatch({ type: 'SET_NEW_MAX_POINTS', points: val })}
                onSave={handleCreate}
                onCancel={() => dispatch({ type: 'CANCEL_CREATE' })}
              />
            )}

            <div className="space-y-3">
              {projectCriteria.map((c) => (
                <CriterionRow
                  key={c.id}
                  criterion={c}
                  isEditing={state.editingId === c.id}
                  isPending={isPending}
                  editName={state.editName}
                  editDescription={state.editDescription}
                  editMaxPoints={state.editMaxPoints}
                  onNameChange={(val) => dispatch({ type: 'SET_EDIT_NAME', name: val })}
                  onDescriptionChange={(val) =>
                    dispatch({ type: 'SET_EDIT_DESCRIPTION', description: val })
                  }
                  onMaxPointsChange={(val) =>
                    dispatch({ type: 'SET_EDIT_MAX_POINTS', points: val })
                  }
                  onStartEdit={() => dispatch({ type: 'START_EDIT', criterion: c })}
                  onCancelEdit={() => dispatch({ type: 'CANCEL_EDIT' })}
                  onUpdate={() => handleUpdate(c.id)}
                  onDelete={() => handleDelete(c.id)}
                />
              ))}

              {projectCriteria.length === 0 && !state.isCreating && (
                <div className="bg-card border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
                  <ClipboardCheck className="mx-auto mb-3 size-8 text-zinc-300" />
                  <h4 className="mb-1 text-[13px] font-semibold text-zinc-900 uppercase dark:text-zinc-100">
                    {t('emptyTitle')}
                  </h4>
                  <p className="mx-auto mb-4 max-w-sm text-xs font-medium text-zinc-400">
                    {t('emptyDesc')}
                  </p>
                  <Button
                    variant="unstyled"
                    onClick={() => dispatch({ type: 'START_CREATE' })}
                    className="inline-flex items-center justify-center gap-2 bg-zinc-900 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <Plus className="size-4" />
                    {t('btnFirstCriterion')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
            <Sparkles className="mx-auto mb-4 size-10 text-zinc-300" />
            <h3 className="mb-2 text-sm font-semibold text-zinc-900 uppercase dark:text-zinc-100">
              {t('noProjectsSelectedTitle')}
            </h3>
            <p className="mx-auto max-w-md text-xs font-medium text-zinc-400">
              {t('noProjectsSelectedDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
