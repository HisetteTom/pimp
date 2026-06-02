'use client';

import { Badge } from '@/components/ui/badge';
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

interface ProjectsSidebarProps {
  projects: Project[];
  selectedProjectId: number | null;
  criteria: Criterion[];
  onSelectProject: (id: number) => void;
}

export function ProjectsSidebar({
  projects,
  selectedProjectId,
  criteria,
  onSelectProject,
}: ProjectsSidebarProps) {
  const t = useTranslations('ProfessorProjectsSidebar');

  return (
    <div className="space-y-4 lg:col-span-4">
      <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
        {t('title')}
      </h3>
      <div className="space-y-2">
        {projects.map((p) => {
          const isSelected = p.id === selectedProjectId;
          const count = criteria.reduce((acc, curr) => {
            return curr.projectId === p.id ? acc + 1 : acc;
          }, 0);

          return (
            <button
              type="button"
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`flex w-full cursor-pointer items-center justify-between border-2 p-4 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-purple-500/30 bg-purple-500/5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:bg-purple-950/10'
                  : 'bg-card border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="space-y-1 truncate pr-2">
                <h4 className="truncate text-[13px] font-semibold text-zinc-900 uppercase dark:text-zinc-100">
                  {p.name}
                </h4>
                <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                  {t('status', { status: p.status })}
                </p>
              </div>
              <Badge className="shrink-0 rounded-none border border-purple-500/20 bg-purple-600/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-purple-600 uppercase dark:text-purple-400">
                {count} {count > 1 ? t('grids') : t('grid')}
              </Badge>
            </button>
          );
        })}
        {projects.length === 0 && (
          <div className="border-2 border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
            <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              {t('empty')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
