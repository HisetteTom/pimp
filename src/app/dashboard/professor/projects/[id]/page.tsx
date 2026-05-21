import { db } from "@/db";
import { project, team, user, task, livrable, projectEnrollment } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectStatusSelector } from "./project-status-selector";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, AlertCircle, ChevronRight, User, Crown } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Groups - Professor Workspace",
  description: "View and manage enrolled student teams and their project spaces.",
};

export default async function ProfessorProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = parseInt(id);

  if (isNaN(projectId)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "professor") {
    redirect("/login");
  }

  // Fetch project, all projects for sidebar, teams, enrollments and users
  const [projectData, allProjects, allTeams, allEnrollments, allUsers] = await Promise.all([
    db.query.project.findFirst({
      where: eq(project.id, projectId),
    }),
    db.select().from(project),
    db.select().from(team).where(eq(team.projectId, projectId)),
    db.select().from(projectEnrollment).where(eq(projectEnrollment.projectId, projectId)),
    db.select().from(user),
  ]);

  if (!projectData) {
    notFound();
  }

  const teamIds = allTeams.map((t) => t.id);

  // Fetch tasks and deliverables for these specific teams
  const [allTasks, allDeliverables] = await Promise.all([
    teamIds.length > 0
      ? db.select().from(task).where(inArray(task.teamId, teamIds))
      : Promise.resolve([]),
    teamIds.length > 0
      ? db.select().from(livrable).where(inArray(livrable.teamId, teamIds))
      : Promise.resolve([]),
  ]);

  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  // Index members by team ID
  const membersByTeam = new Map<number, typeof allUsers>();
  for (const e of allEnrollments) {
    if (!e.teamId) continue;
    const u = userMap.get(e.userId);
    if (!u) continue;
    const list = membersByTeam.get(e.teamId) || [];
    list.push(u);
    membersByTeam.set(e.teamId, list);
  }

  // Group tasks by team ID
  const tasksByTeam = new Map<number, typeof allTasks>();
  for (const t of allTasks) {
    const list = tasksByTeam.get(t.teamId) || [];
    list.push(t);
    tasksByTeam.set(t.teamId, list);
  }

  // Group deliverables by team ID
  const deliverablesByTeam = new Map<number, typeof allDeliverables>();
  for (const d of allDeliverables) {
    const list = deliverablesByTeam.get(d.teamId) || [];
    list.push(d);
    deliverablesByTeam.set(d.teamId, list);
  }

  // Sidebar dynamic navigation list
  const userProjectsData = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <DashboardLayout userProjects={userProjectsData}>
      <div className="space-y-8 pb-12">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard/professor"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Project Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between border-b border-zinc-150 dark:border-zinc-800 pb-8">
          <div className="space-y-2.5 max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase leading-none">
              {projectData.name}
            </h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {projectData.description || "No description provided for this project proposal."}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 text-primary" />
                Start: {projectData.dateStart ? projectData.dateStart.split("-").reverse().join("/") : "TBD"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 text-primary" />
                End: {projectData.dateEnd ? projectData.dateEnd.split("-").reverse().join("/") : "TBD"}
              </span>
            </div>
          </div>
          <ProjectStatusSelector projectId={projectId} initialStatus={projectData.status} />
        </div>

        {/* Teams Overview Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
              Enrolled Teams ({allTeams.length})
            </h2>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {allTeams.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-none bg-zinc-50/50 dark:bg-zinc-900/10 text-center space-y-3">
              <AlertCircle className="size-8 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-semibold uppercase text-zinc-700 dark:text-zinc-300">No Teams Assigned</h3>
              <p className="text-xs text-zinc-400 font-bold max-w-sm mx-auto uppercase tracking-wide">
                No student teams have registered or enrolled in this project proposal yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {allTeams.map((t) => {
                const teamMembers = membersByTeam.get(t.id) || [];
                const teamTasks = tasksByTeam.get(t.id) || [];
                const teamLivrables = deliverablesByTeam.get(t.id) || [];

                // Compute task stats
                const doneTasks = teamTasks.filter((task) => task.status === "done").length;
                const progressPercent = teamTasks.length > 0 ? Math.round((doneTasks / teamTasks.length) * 100) : 0;

                const hasComments = t.feedback && t.feedback.trim().length > 0;

                return (
                  <Card
                    key={t.id}
                    className="group relative flex flex-col h-full overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/50 justify-between rounded-none"
                  >
                    {/* SVG grid graphic */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.1]">
                      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id={`grid-${t.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#grid-${t.id})`} />
                      </svg>
                    </div>

                    <CardHeader className="p-8 pb-4 space-y-4 relative z-10">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-tighter text-secondary uppercase">
                          {t.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-3">
                          {hasComments && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black uppercase text-[9px] tracking-wider rounded-none px-2.5 py-1">
                              Comments Added
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-zinc-300 text-zinc-500 dark:border-zinc-700 bg-transparent font-black uppercase text-[9px] tracking-wider rounded-none px-2.5 py-1">
                            {teamLivrables.length} Deliverable{teamLivrables.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-8 pb-8 pt-2 gap-y-6 flex-1 flex flex-col justify-between relative z-10">
                      {/* Task Stats & Progress */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Progress</span>
                          <span className="font-mono text-[10px] font-black text-secondary">{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-primary/80 to-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">
                          {doneTasks} of {teamTasks.length} tasks completed
                        </p>
                      </div>

                      {/* Team Members List */}
                      <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <h4 className="font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
                          Enrolled Members ({teamMembers.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {teamMembers.length === 0 ? (
                            <p className="text-xs text-zinc-400 font-bold uppercase italic">
                              No members enrolled.
                            </p>
                          ) : (
                            teamMembers.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 rounded-none uppercase"
                              >
                                {m.responsabilityId ? (
                                  <Crown className="size-3 text-amber-500" />
                                ) : (
                                  <User className="size-3 text-zinc-400" />
                                )}
                                <span>{m.name || "Unknown"}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <Link href={`/dashboard/professor/projects/${projectId}/teams/${t.id}`}>
                          <Button className="w-full h-12 text-sm font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider rounded-none flex items-center justify-center gap-1">
                            Open Group Space
                            <ChevronRight className="size-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
