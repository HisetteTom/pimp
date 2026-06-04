'use client';

import { useState, useEffect, useRef } from 'react';
import { getStudentTeams } from '@/app/dashboard/actions-chat';
import { ChatWindow } from '@/components/dashboard/chat-window';
import { Card } from '@/components/ui/card';
import { RiMessage3Line, RiGroupLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface StudentTeam {
  id: number;
  name: string;
  projectName: string;
  unreadCount: number;
  members: string[];
}

interface StudentChatViewProps {
  initialTeams: StudentTeam[];
}

export function StudentChatView({ initialTeams }: StudentChatViewProps) {
  const [teams, setTeams] = useState<StudentTeam[]>(initialTeams);
  const [selectedTeam, setSelectedTeam] = useState<StudentTeam | null>(
    initialTeams.length > 0 ? initialTeams[0] : null,
  );

  // Project filter state
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const selectedTeamRef = useRef(selectedTeam);
  useEffect(() => {
    selectedTeamRef.current = selectedTeam;
  }, [selectedTeam]);

  // Extract unique project names dynamically
  const uniqueProjects = Array.from(new Set(teams.map((t) => t.projectName)));

  // Filter teams based on selected project
  const filteredTeams =
    selectedProject === 'all' ? teams : teams.filter((t) => t.projectName === selectedProject);

  // Poll list of student teams to get fresh unread counts in real-time
  useEffect(() => {
    let active = true;

    async function fetchTeams() {
      try {
        const list = await getStudentTeams();
        if (active) {
          setTeams(list);
          if (selectedTeamRef.current) {
            const activeTeam = selectedTeamRef.current;
            // Keep selected team details updated
            const updatedSelected = list.find((t) => t.id === activeTeam.id);
            if (updatedSelected) {
              setSelectedTeam(updatedSelected);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch student teams:', err);
      }
    }

    const interval = setInterval(() => {
      fetchTeams();
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (teams.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
        <RiMessage3Line className="size-10 text-zinc-300" />
        <span className="text-xs font-black tracking-widest text-zinc-400 uppercase">
          No Enrolled Teams
        </span>
        <p className="max-w-sm text-xs text-zinc-400">
          You must be registered in a team and project to join group discussions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[500px] w-full gap-6">
      {/* Left panel: list of student teams with Project Filter */}
      <Card className="flex w-80 shrink-0 flex-col overflow-hidden border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header & Project Filter Dropdown */}
        <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 dark:border-zinc-800">
          <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">
            Active Project Teams
          </h2>

          <Select
            value={selectedProject}
            onValueChange={(val) => {
              setSelectedProject(val);
              // Auto-select first team of the filtered set
              const filtered = val === 'all' ? teams : teams.filter((t) => t.projectName === val);
              if (filtered.length > 0) {
                setSelectedTeam(filtered[0]);
              } else {
                setSelectedTeam(null);
              }
            }}
          >
            <SelectTrigger className="w-full border-zinc-200 bg-zinc-50 text-xs font-bold dark:border-zinc-800 dark:bg-zinc-900">
              <SelectValue placeholder="Filter by Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-bold uppercase">
                All Projects
              </SelectItem>
              {uniqueProjects.map((pName) => (
                <SelectItem key={pName} value={pName} className="text-xs font-bold uppercase">
                  {pName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Teams List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredTeams.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">No teams found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filteredTeams.map((t) => {
                const isSelected = selectedTeam?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTeam(t)}
                    className={cn(
                      'group flex w-full flex-col items-start gap-1 rounded-xl p-3 text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900',
                      isSelected ? 'bg-purple-500/5 dark:bg-purple-500/10' : 'bg-transparent',
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span
                        className={cn(
                          'truncate text-xs font-black tracking-tight uppercase',
                          isSelected
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-zinc-800 dark:text-zinc-200',
                        )}
                      >
                        {t.name}
                      </span>
                      {t.unreadCount > 0 && (
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
                          {t.unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="truncate text-[9px] font-bold text-zinc-400 uppercase dark:text-zinc-500">
                      {t.projectName}
                    </span>
                    <div className="mt-1 flex items-center gap-1 text-[8px] font-bold text-zinc-400/80 dark:text-zinc-500/80">
                      <RiGroupLine className="size-3 shrink-0" />
                      <span className="truncate">{t.members.join(', ')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Right panel: selected team's chat */}
      <div className="flex-1">
        {selectedTeam ? (
          <ChatWindow
            key={selectedTeam.id}
            teamId={selectedTeam.id}
            teamName={`Group: ${selectedTeam.name}`}
            projectName={selectedTeam.projectName}
            subtitle={`Teammates: ${selectedTeam.members.join(', ')}`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
            <RiMessage3Line className="size-10 text-zinc-300" />
            <span className="text-xs font-black tracking-widest text-zinc-400 uppercase">
              No Group Selected
            </span>
            <p className="text-xs text-zinc-400">
              Select a group from the list on the left to read and send messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
