import { useReducer, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '../kanban-board';
import { TaskListView } from '../task-list-view';
import {
  StudentTimelineAndEvolution,
  StudentTaskStatsAndBreakdown,
  ClientDate,
  Task,
} from './student-charts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, UploadCloud, FileText, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface Member {
  id: string;
  name: string;
  responsabilityId: number | null;
}

export interface Deliverable {
  id: number;
  name: string;
  source: string | null;
  status: string;
  feedback: string | null;
  teamId: number;
  createdAt: Date;
}

const FeedbackSlot = ({
  titleKey,
  feedback,
}: {
  titleKey: 'overview' | 'kanban' | 'list' | 'deliverables';
  feedback?: string | null;
}) => {
  const t = useTranslations('StudentSections');
  const translatedTitle = t(titleKey);
  return (
    <div className="border-primary/20 bg-primary/5 mt-[-16px] flex flex-col gap-y-2 rounded-none border-2 p-6">
      <h4 className="text-primary text-[10px] font-semibold tracking-widest uppercase">
        {t('teacherFeedback', { title: translatedTitle })}
      </h4>
      {feedback ? (
        <p className="text-sm font-medium whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
          {feedback}
        </p>
      ) : (
        <p className="text-sm font-medium text-zinc-600 italic dark:text-zinc-400">
          {t('noFeedback')}
        </p>
      )}
    </div>
  );
};

export interface StudentOverviewSectionProps {
  project: {
    id: number;
    name: string;
    description?: string | null;
    dateStart?: string | null;
    dateEnd?: string | null;
  };
  timelineProgress: number;
  chartData: { label: string; count: number }[];
  completionPercentage: number;
  tasks: Task[];
  taskStats: { name: string; value: number }[];
  tasksByStatus: {
    todo: Task[];
    in_progress: Task[];
    done: Task[];
  };
  feedback: string;
}

export function StudentOverviewSection({
  project,
  timelineProgress,
  chartData,
  completionPercentage,
  tasks,
  taskStats,
  tasksByStatus,
  feedback,
}: StudentOverviewSectionProps) {
  return (
    <div className="flex flex-col gap-y-8">
      <StudentTimelineAndEvolution
        project={project}
        timelineProgress={timelineProgress}
        chartData={chartData}
        completionPercentage={completionPercentage}
      />

      <StudentTaskStatsAndBreakdown
        tasks={tasks}
        taskStats={taskStats}
        tasksByStatus={tasksByStatus}
      />
      <FeedbackSlot titleKey="overview" feedback={feedback} />
    </div>
  );
}

export interface StudentKanbanSectionProps {
  tasks: Task[];
  project: { id: number; name: string };
  team: { id: number; members: Member[] };
  feedback: string;
}

export function StudentKanbanSection({
  tasks,
  project,
  team,
  feedback,
}: StudentKanbanSectionProps) {
  return (
    <div className="flex flex-col gap-y-8">
      <KanbanBoard
        key={
          tasks.length === 0
            ? 'empty'
            : tasks
                .map(
                  (t) =>
                    `${t.id}-${t.status}-${t.name}-${t.assigneeId}-${t.assignees || ''}-${t.priority}-${t.deadline}-${t.description}`,
                )
                .join(',')
        }
        initialTasks={tasks}
        projectId={project.id}
        members={team.members}
        teamId={team.id}
      />
      <FeedbackSlot titleKey="kanban" feedback={feedback} />
    </div>
  );
}

export interface StudentListSectionProps {
  tasks: Task[];
  project: { id: number; name: string };
  team: { id: number; members: Member[] };
  feedback: string;
}

export function StudentListSection({ tasks, project, team, feedback }: StudentListSectionProps) {
  return (
    <div className="flex flex-col gap-y-8">
      <TaskListView
        key={
          tasks.length === 0
            ? 'empty-list'
            : tasks
                .map(
                  (t) =>
                    `${t.id}-${t.status}-${t.name}-${t.assigneeId}-${t.assignees || ''}-${t.priority}-${t.deadline}-${t.description}`,
                )
                .join(',')
        }
        initialTasks={tasks}
        projectId={project.id}
        members={team.members}
        teamId={team.id}
      />
      <FeedbackSlot titleKey="list" feedback={feedback} />
    </div>
  );
}

export interface StudentDeliverablesSectionProps {
  project: { id: number; name: string };
  team: { id: number; name: string };
  livrables: Deliverable[];
  feedback: string;
}

interface FormState {
  open: boolean;
  editingDeliverable: Deliverable | null;
  name: string;
  uploading: boolean;
}

type FormAction =
  | { type: 'OPEN_NEW' }
  | { type: 'OPEN_EDIT'; deliverable: Deliverable }
  | { type: 'CLOSE' }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_UPLOADING'; uploading: boolean };

/**
 * Local state reducer for managing file deliverable submission modal.
 * Tracks upload action progression, active editing entity, and upload loading indicator.
 */
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'OPEN_NEW':
      return { open: true, editingDeliverable: null, name: '', uploading: false };
    case 'OPEN_EDIT':
      return {
        open: true,
        editingDeliverable: action.deliverable,
        name: action.deliverable.name,
        uploading: false,
      };
    case 'CLOSE':
      return { ...state, open: false, editingDeliverable: null, name: '' };
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_UPLOADING':
      return { ...state, uploading: action.uploading };
    default:
      return state;
  }
}

export function StudentDeliverablesSection({
  team,
  livrables,
  feedback,
}: StudentDeliverablesSectionProps) {
  const t = useTranslations('StudentSections');
  const [state, dispatch] = useReducer(formReducer, {
    open: false,
    editingDeliverable: null,
    name: '',
    uploading: false,
  });

  const fileRef = useRef<File | null>(null);
  const { refresh } = useRouter();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      dispatch({ type: 'CLOSE' });
      fileRef.current = null;
    }
  };

  const startNewUpload = () => {
    fileRef.current = null;
    dispatch({ type: 'OPEN_NEW' });
  };

  const startEditing = (l: Deliverable) => {
    fileRef.current = null;
    dispatch({ type: 'OPEN_EDIT', deliverable: l });
  };

  /**
   * Dispatches a multipart request to the upload endpoint.
   * Performs validation checks and triggers page data refresh upon success.
   */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.name) {
      toast.error(t('pleaseEnterName'));
      return;
    }
    if (!state.editingDeliverable && !fileRef.current) {
      toast.error(t('pleaseSelectFile'));
      return;
    }

    dispatch({ type: 'SET_UPLOADING', uploading: true });
    const formData = new FormData();
    if (fileRef.current) {
      formData.append('file', fileRef.current);
    }
    formData.append('teamId', team.id.toString());
    formData.append('name', state.name);
    if (state.editingDeliverable) {
      formData.append('deliverableId', state.editingDeliverable.id.toString());
    }

    try {
      const response = await fetch('/api/deliverables/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to submit deliverable');
        dispatch({ type: 'SET_UPLOADING', uploading: false });
        return;
      }

      toast.success(
        state.editingDeliverable
          ? t('updateSuccess', { name: state.name })
          : t('uploadSuccess', { name: state.name }),
      );
      dispatch({ type: 'CLOSE' });
      fileRef.current = null;
      refresh();
    } catch (err) {
      console.error(err);
      const errMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(errMessage || t('errorSubmission'));
      dispatch({ type: 'SET_UPLOADING', uploading: false });
    }
  };

  return (
    <div className="flex flex-col gap-y-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight uppercase">{t('filesDeliverables')}</h3>
        <Dialog open={state.open} onOpenChange={handleOpenChange}>
          <Button
            onClick={startNewUpload}
            className="text-xs font-semibold tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)]"
          >
            {t('uploadFile')}
          </Button>
          <DialogContent className="max-w-md rounded-none border-2 border-zinc-200 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold tracking-wider uppercase">
                {state.editingDeliverable ? t('modifyDeliverable') : t('uploadDeliverable')}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                {state.editingDeliverable
                  ? t('updateDescription', { name: state.editingDeliverable.name })
                  : t('submitDescription', { name: team.name })}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1">
                <Label
                  htmlFor="deliv-name"
                  className="text-[10px] font-semibold tracking-widest uppercase"
                >
                  {t('deliverableName')}
                </Label>
                <Input
                  id="deliv-name"
                  type="text"
                  placeholder={t('deliverablePlaceholder')}
                  value={state.name}
                  onChange={(e) => dispatch({ type: 'SET_NAME', name: e.target.value })}
                  className="rounded-none border-2 border-zinc-200 dark:border-zinc-800"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="deliv-file"
                  className="text-[10px] font-semibold tracking-widest uppercase"
                >
                  {t('file')}{' '}
                  {state.editingDeliverable && (
                    <span className="font-normal text-zinc-400 normal-case">{t('optional')}</span>
                  )}
                </Label>
                <Input
                  id="deliv-file"
                  type="file"
                  onChange={(e) => {
                    fileRef.current = e.target.files?.[0] || null;
                  }}
                  className="rounded-none border-2 border-zinc-200 pt-1.5 dark:border-zinc-800"
                  required={!state.editingDeliverable}
                />
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="rounded-none border-2 text-xs uppercase"
                  disabled={state.uploading}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  className="rounded-none text-xs uppercase"
                  disabled={state.uploading}
                >
                  {state.uploading ? (
                    <>
                      <Loader2 className="mr-2 size-3 animate-spin" />
                      {t('submitting')}
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 size-4" />
                      {state.editingDeliverable ? t('updateDeliverableBtn') : t('uploadStorageBtn')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                {t('fileName')}
              </th>
              <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                {t('date')}
              </th>
              <th className="p-4 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                {t('status')}
              </th>
              <th className="p-4 text-right text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {livrables.length > 0 ? (
              livrables.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                >
                  <td className="p-4 font-bold uppercase">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-purple-600" />
                      <div>
                        <span className="block">{l.name}</span>
                        {l.feedback && (
                          <span className="text-muted-foreground mt-1 block text-[10px] normal-case italic">
                            Feedback: {l.feedback}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">
                    <ClientDate date={l.createdAt} />
                  </td>
                  <td className="p-4">
                    {l.status === 'approved' ? (
                      <Badge className="rounded-none border-none bg-emerald-500 text-[9px] font-black tracking-wider text-white uppercase hover:bg-emerald-600">
                        {t('approved')}
                      </Badge>
                    ) : l.status === 'rejected' ? (
                      <Badge className="rounded-none border-none bg-red-500 text-[9px] font-black tracking-wider text-white uppercase hover:bg-red-600">
                        {t('rejected')}
                      </Badge>
                    ) : (
                      <Badge className="rounded-none border-none bg-amber-500 text-[9px] font-black tracking-wider text-white uppercase hover:bg-amber-600">
                        {t('pending')}
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => startEditing(l)}
                        variant="outline"
                        className="inline-flex h-8 items-center border-2 border-zinc-200 bg-transparent px-3 text-[10px] font-bold tracking-wider text-zinc-600 uppercase transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                      >
                        {t('modify')}
                      </Button>
                      <a
                        href={`/api/deliverables/download/${l.id}`}
                        className="inline-flex h-8 items-center gap-1.5 border-2 border-zinc-200 bg-transparent px-3 text-[10px] font-bold tracking-wider text-zinc-600 uppercase transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                      >
                        <Download className="size-3" />
                        {t('download')}
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center font-medium text-zinc-400 italic">
                  {t('noFiles')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <FeedbackSlot titleKey="deliverables" feedback={feedback} />
    </div>
  );
}
