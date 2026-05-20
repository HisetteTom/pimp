"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, ArrowRight } from "lucide-react";
import { createTeam, joinTeam } from "@/app/dashboard/student/actions";
import { cn } from "@/lib/utils";

interface TeamSelectionProps {
  projectId: number;
  teams: any[];
  maxGroups: number;
  maxMembers: number;
}

export function TeamSelection({ projectId, teams, maxGroups, maxMembers }: TeamSelectionProps) {
  const [isPending, startTransition] = useTransition();
  const [newTeamName, setNewTeamName] = useState("");

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
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold uppercase tracking-tight">Available Teams</h2>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <span className="font-mono text-xs font-bold text-zinc-400">
            {teams.length} / {maxGroups} GROUPS
          </span>
        </div>

        {teams.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 text-center space-y-2">
            <Users className="size-12 mx-auto text-zinc-300" />
            <p className="text-zinc-500 font-medium italic">No teams have been created yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {teams.map((team) => (
              <Card key={team.id} className="border-2 border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-all group">
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-semibold tracking-tighter uppercase line-clamp-1">{team.name}</CardTitle>
                    <div className="shrink-0 font-mono text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded border">
                      {team.members.length} / {maxMembers}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex flex-wrap gap-1.5">
                    {team.members.map((m: any) => (
                      <div key={m.id} className="size-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold" title={m.name}>
                        {m.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button 
                    onClick={() => handleJoinTeam(team.id)} 
                    disabled={isPending || team.members.length >= maxMembers}
                    className="w-full font-black uppercase tracking-wider text-xs h-10"
                    variant={team.members.length >= maxMembers ? "outline" : "default"}
                  >
                    {team.members.length >= maxMembers ? "FULL" : "JOIN TEAM"}
                    <ArrowRight className="ml-2 size-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold uppercase tracking-tight">Create New</h2>
        <Card className="border-2 border-primary/20 shadow-[8px_8px_0px_0px_rgba(var(--primary-rgb),0.1)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold uppercase">Start a Team</CardTitle>
            <CardDescription>You will become the Team Leader.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Team Name</Label>
              <Input 
                id="team-name" 
                placeholder="E.G. THE PIXELS" 
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="font-bold border-2 focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCreateTeam} 
              disabled={isPending || !newTeamName.trim() || teams.length >= maxGroups}
              className="w-full font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              {isPending ? "CREATING..." : "CREATE TEAM"}
              <Plus className="ml-2 size-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
