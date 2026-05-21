"use client";

import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="lg:col-span-4 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        Projects Directory
      </h3>
      <div className="space-y-2">
        {projects.map((p) => {
          const isSelected = p.id === selectedProjectId;
          const count = criteria.reduce((acc, curr) => {
            return curr.projectId === p.id ? acc + 1 : acc;
          }, 0);

          return (
            <button
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`w-full text-left p-4 border-2 transition-all duration-200 cursor-pointer flex items-center justify-between ${
                isSelected
                  ? "border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
                  : "border-zinc-200 dark:border-zinc-800 bg-card hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <div className="space-y-1 truncate pr-2">
                <h4 className="text-[13px] font-semibold uppercase text-zinc-900 dark:text-zinc-100 truncate">
                  {p.name}
                </h4>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Status: {p.status}
                </p>
              </div>
              <Badge className="bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold text-[9px] shrink-0 uppercase tracking-widest rounded-none px-2 py-0.5">
                {count} {count > 1 ? "grids" : "grid"}
              </Badge>
            </button>
          );
        })}
        {projects.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              No active projects found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
