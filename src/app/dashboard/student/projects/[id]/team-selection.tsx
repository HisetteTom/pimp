'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, ArrowRight, Crown } from 'lucide-react';
import { createTeam, joinTeam } from '@/app/dashboard/student/actions';

interface TeamMember {
  id: string;
  name: string;
  responsabilityId: number | null;
}

interface Team {
  id: number;
  name: string;
  members: TeamMember[];
}

interface TeamSelectionProps {
  projectId: number;
  teams: Team[];
  maxGroups: number;
  maxMembers: number;
}

export function TeamSelection({ projectId, teams, maxGroups, maxMembers }: TeamSelectionProps) {
  const [isPending, startTransition] = useTransition();
  const [newTeamName, setNewTeamName] = useState('');

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    startTransition(async () => {
      await createTeam(projectId, newTeamName);
    });
  };

  const handleJoinTeam = (teamId: number) => {
    startTransition(async () => {
      await joinTeam(projectId, teamId);
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight uppercase">Available Teams</h2>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <span className="font-mono text-xs font-bold text-zinc-400">
            {teams.length} / {maxGroups} GROUPS
          </span>
        </div>

        {teams.length === 0 ? (
          <div className="space-y-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <Users className="mx-auto size-12 text-zinc-300" />
            <p className="font-medium text-zinc-500 italic">
              No teams have been created yet. Be the first!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {teams.map((team) => (
              <Card
                key={team.id}
                className="hover:border-primary/50 group border-2 border-zinc-200 transition-all dark:border-zinc-800"
              >
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="line-clamp-1 text-xl font-semibold tracking-tighter uppercase">
                      {team.name}
                    </CardTitle>
                    <div className="shrink-0 rounded border bg-zinc-100 px-2 py-1 font-mono text-[10px] font-black dark:bg-zinc-800">
                      {team.members.length} / {maxMembers}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex flex-wrap gap-1.5">
                    {team.members.map((m: TeamMember) => (
                      <div key={m.id} className="group/member relative" title={m.name}>
                        <div className="flex size-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold dark:bg-zinc-800">
                          {m.name.charAt(0)}
                        </div>
                        {m.responsabilityId === 1 && (
                          <div className="absolute -top-1 -right-1 rounded-full border border-white bg-amber-500 p-0.5 shadow-sm dark:border-zinc-950">
                            <Crown className="size-2 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={isPending || team.members.length >= maxMembers}
                    className="h-10 w-full text-xs font-black tracking-wider uppercase"
                    variant={team.members.length >= maxMembers ? 'outline' : 'default'}
                  >
                    {team.members.length >= maxMembers ? 'FULL' : 'JOIN TEAM'}
                    <ArrowRight className="ml-2 size-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight uppercase">Create New</h2>
        <Card className="border-primary/20 border-2 shadow-[8px_8px_0px_0px_rgba(var(--primary-rgb),0.1)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold uppercase">Start a Team</CardTitle>
            <CardDescription>You will become the Team Leader.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="team-name"
                className="text-[10px] font-black tracking-widest text-zinc-400 uppercase"
              >
                Team Name
              </Label>
              <Input
                id="team-name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="focus-visible:ring-primary border-2 font-bold"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateTeam}
              disabled={isPending || !newTeamName.trim() || teams.length >= maxGroups}
              className="w-full font-black tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {isPending ? 'CREATING...' : 'CREATE TEAM'}
              <Plus className="ml-2 size-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
