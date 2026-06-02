'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveTeamNotes } from '../../../../../actions';
import { useTranslations } from 'next-intl';

export interface SupervisorNotesEditorProps {
  teamId: number;
  projectId: number;
  initialNotes: string | null;
  readOnly?: boolean;
}

export function SupervisorNotesEditor({
  teamId,
  projectId,
  initialNotes,
  readOnly = false,
}: SupervisorNotesEditorProps) {
  const t = useTranslations('ProfessorSupervisorNotesEditor');
  const { refresh } = useRouter();
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isSavingNotes, startSaveTransition] = useTransition();

  const initialNotesArray = (() => {
    if (initialNotes) {
      try {
        const parsed = JSON.parse(initialNotes);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [
      {
        id: '1',
        title: t('defaultTitle1'),
        content: t('defaultContent1'),
      },
      {
        id: '2',
        title: t('defaultTitle2'),
        content: t('defaultContent2'),
      },
    ];
  })();

  const [notes, setNotes] = useState<{ id: string; title: string; content: string }[]>(
    () => initialNotesArray,
  );

  const handleAddSection = () => {
    if (readOnly || !newSectionTitle.trim()) return;
    setNotes((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newSectionTitle.trim(),
        content: '',
      },
    ]);
    setNewSectionTitle('');
  };

  const handleUpdateSectionContent = (id: string, text: string) => {
    if (readOnly) return;
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content: text } : n)));
  };

  const handleUpdateSectionTitle = (id: string, title: string) => {
    if (readOnly) return;
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, title } : n)));
  };

  const handleDeleteSection = (id: string) => {
    if (readOnly) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSaveNotes = () => {
    if (readOnly) return;
    startSaveTransition(async () => {
      try {
        await saveTeamNotes(teamId, JSON.stringify(notes), projectId);
        toast.success(t('saveSuccess'));
        refresh();
      } catch (err) {
        toast.error(t('saveError'));
        console.error(err);
      }
    });
  };

  const isNotesChanged = JSON.stringify(notes) !== JSON.stringify(initialNotesArray);

  return (
    <Card className="group hover:border-primary/50 relative flex flex-col overflow-hidden rounded-none border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
      {/* SVG grid graphic */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.1]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="notes-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#notes-grid)" />
        </svg>
      </div>

      <CardHeader className="relative z-10 flex flex-col gap-4 border-b border-zinc-100 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <CardTitle className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
            {t('title')}
          </CardTitle>
        </div>
        {!readOnly && (
          <Button
            onClick={handleSaveNotes}
            disabled={isSavingNotes || !isNotesChanged}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-none text-xs font-black tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:h-10"
          >
            {isSavingNotes ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {t('saveNotes')}
          </Button>
        )}
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col gap-y-4 p-6 pt-4">
        {!readOnly && (
          <div className="flex flex-col items-stretch justify-between gap-4 border border-dashed border-zinc-200 bg-zinc-50/50 p-4 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900/5">
            <div className="max-w-md flex-1">
              <input
                type="text"
                aria-label={t('placeholderNewTitle')}
                placeholder={t('placeholderNewTitle')}
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="focus:border-primary w-full rounded-none border border-zinc-200 bg-white p-2.5 text-xs font-bold uppercase outline-none dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <Button
              onClick={handleAddSection}
              disabled={!newSectionTitle.trim()}
              variant="outline"
              className="dark:hover:bg-zinc-850 flex h-10 cursor-pointer items-center justify-center gap-1 rounded-none border-2 border-zinc-900 text-[10px] font-black uppercase transition-all hover:bg-zinc-100 dark:border-zinc-100"
            >
              <Plus className="size-3.5" />
              {t('addSection')}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-y-6">
          {notes.length === 0 ? (
            <p className="py-6 text-center text-xs font-bold text-zinc-400 uppercase italic">
              {t('emptyText')}
            </p>
          ) : (
            notes.map((section) => (
              <div
                key={section.id}
                className="relative flex flex-col gap-y-3 border border-zinc-200 bg-zinc-50/30 p-5 dark:border-zinc-800 dark:bg-zinc-900/5"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                  <input
                    type="text"
                    aria-label={t('sectionTitle')}
                    value={section.title}
                    onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                    disabled={readOnly}
                    className="focus:border-primary w-full max-w-xs border-b border-transparent bg-transparent py-0.5 text-xs font-black tracking-wider text-zinc-900 uppercase hover:border-zinc-200 focus:outline-none disabled:cursor-not-allowed dark:text-zinc-100"
                  />
                  {!readOnly && (
                    <Button
                      onClick={() => handleDeleteSection(section.id)}
                      variant="unstyled"
                      className="flex size-7 cursor-pointer items-center justify-center rounded-none p-0 text-zinc-600 hover:bg-zinc-100 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-red-400"
                      title={t('deleteSection')}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  rows={4}
                  value={section.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleUpdateSectionContent(section.id, e.target.value)
                  }
                  disabled={readOnly}
                  className="focus-visible:ring-primary resize-y rounded-none border border-zinc-200 bg-white p-3 font-mono text-xs leading-relaxed font-medium text-zinc-700 disabled:cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
