import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateProjectDialog } from "./create-project-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/db";
import { project, user, team, projectEnrollment, task, livrable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";
import { FolderRoot, Users, GraduationCap, ClipboardCheck, ArrowRight, Loader2, Clock, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Professor Dashboard - PIMP",
  description: "Monitor student projects, validate deliverables, and grade teams.",
};

export default async function ProfessorDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "professor") {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
        <Card className="max-w-md border-2 border-red-500/20 shadow-xl bg-card rounded-none">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-black text-red-500 uppercase tracking-tight">Access Denied</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Professor Role Required
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6 space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              You must be logged in as a professor to access this administration panel.
            </p>
            <Link href="/login" className="inline-block px-5 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-black uppercase tracking-wider text-xs transition-transform active:scale-95">
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch all resources in parallel
  const [allProjects, allTeams, allEnrollments, allUsers, allTasks, allDeliverables] = await Promise.all([
    db.select().from(project),
    db.select().from(team),
    db.select().from(projectEnrollment),
    db.select().from(user),
    db.select().from(task),
    db.select().from(livrable),
  ]);

  // Index maps
  const userMap = new Map(allUsers.map((u) => [u.id, u]));
  const teamsByProject = new Map<number, typeof allTeams>();
  for (const t of allTeams) {
    const list = teamsByProject.get(t.projectId) || [];
    list.push(t);
    teamsByProject.set(t.projectId, list);
  }

  const teamIdsByProject = new Map<number, Set<number>>();
  for (const t of allTeams) {
    const set = teamIdsByProject.get(t.projectId) || new Set();
    set.add(t.id);
    teamIdsByProject.set(t.projectId, set);
  }

  // Calculate metrics
  const totalProjects = allProjects.length;
  const totalTeams = allTeams.length;

  const studentIds = new Set<string>();
  for (const u of allUsers) {
    if (u.role === "student") {
      studentIds.add(u.id);
    }
  }

  const enrolledStudentIds = new Set<string>();
  for (const e of allEnrollments) {
    if (studentIds.has(e.userId)) {
      enrolledStudentIds.add(e.userId);
    }
  }
  const totalEnrolledStudents = enrolledStudentIds.size;

  const pendingDeliverables = allDeliverables.filter((d) => d.status === "pending").length;

  // Function to render status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "proposed":
        return <Badge variant="outline" className="border-zinc-300 text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 uppercase font-black text-[9px] tracking-widest rounded-none">Proposed</Badge>;
      case "validated":
        return <Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/5 uppercase font-black text-[9px] tracking-widest rounded-none">Validated</Badge>;
      case "ongoing":
        return <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/5 uppercase font-black text-[9px] tracking-widest rounded-none">Ongoing</Badge>;
      case "late":
        return <Badge variant="outline" className="border-red-500/30 text-red-600 bg-red-500/5 uppercase font-black text-[9px] tracking-widest rounded-none">Late</Badge>;
      case "delivered":
        return <Badge variant="outline" className="border-purple-500/30 text-purple-600 bg-purple-500/5 uppercase font-black text-[9px] tracking-widest rounded-none">Delivered</Badge>;
      case "presented":
        return <Badge variant="outline" className="border-indigo-500/30 text-indigo-600 bg-indigo-500/5 uppercase font-black text-[9px] tracking-widest rounded-none">Presented</Badge>;
      case "closed":
        return <Badge variant="outline" className="border-zinc-400 text-zinc-600 bg-zinc-100 dark:bg-zinc-900 uppercase font-black text-[9px] tracking-widest rounded-none">Closed</Badge>;
      default:
        return <Badge variant="outline" className="uppercase font-black text-[9px] tracking-widest rounded-none">{status}</Badge>;
    }
  };

  // Build projects overview data
  const projectsData = allProjects.map((p) => {
    const projTeams = teamsByProject.get(p.id) || [];
    const projTeamIds = teamIdsByProject.get(p.id) || new Set<number>();
    
    // Calculate tasks progress for teams under this project
    const projTasks = allTasks.filter((t) => projTeamIds.has(t.teamId));
    const doneTasks = projTasks.filter((t) => t.status === "done").length;
    const progressPercent = projTasks.length > 0 ? Math.round((doneTasks / projTasks.length) * 100) : 0;

    return {
      ...p,
      teamsCount: projTeams.length,
      progress: progressPercent,
      totalTasksCount: projTasks.length,
      doneTasksCount: doneTasks,
    };
  });

  const userProjectsData = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <DashboardLayout userProjects={userProjectsData}>
      <div className="space-y-10 pb-10">
        {/* Header Section */}
        <div id="top" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between scroll-mt-10">
          <div>
            <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">
              Professor Dashboard
            </h1>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
              High-level overview and administrative management of all student cohorts.
            </p>
          </div>
          <CreateProjectDialog />
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-zinc-200 dark:border-zinc-800 bg-card rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-none transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-y-0">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Active Proposals</span>
              <FolderRoot className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">{totalProjects}</div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                Total proposed subjects
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-zinc-200 dark:border-zinc-800 bg-card rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-none transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-y-0">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Assigned Teams</span>
              <Users className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">{totalTeams}</div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                Active working groups
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-zinc-200 dark:border-zinc-800 bg-card rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-none transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-y-0">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Students Enrolled</span>
              <GraduationCap className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">{totalEnrolledStudents}</div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                Unique student accounts
              </p>
            </CardContent>
          </Card>

          <Card className={`border-2 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-none transition-shadow ${pendingDeliverables > 0 ? "border-amber-500/40 bg-amber-500/[0.02]" : "border-zinc-200 dark:border-zinc-800 bg-card"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-y-0">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Pending Reviews</span>
              <ClipboardCheck className={`size-4 ${pendingDeliverables > 0 ? "text-amber-500 animate-pulse" : "text-purple-500"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">{pendingDeliverables}</div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                Deliverables awaiting review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Table Section */}
        <section id="projects" className="space-y-4 scroll-mt-10">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Active Projects</h2>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <Badge className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-black rounded-none">{totalProjects}</Badge>
          </div>

          <Card className="border-2 border-zinc-200 dark:border-zinc-800 bg-card rounded-none overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900 border-b-2 border-zinc-200 dark:border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[35%] font-black uppercase text-[10px] tracking-wider text-zinc-500 py-4 pl-6">Project Subject</TableHead>
                  <TableHead className="w-[15%] font-black uppercase text-[10px] tracking-wider text-zinc-500 p-4">Status</TableHead>
                  <TableHead className="w-[15%] font-black uppercase text-[10px] tracking-wider text-zinc-500 p-4 text-center">Teams</TableHead>
                  <TableHead className="w-[20%] font-black uppercase text-[10px] tracking-wider text-zinc-500 p-4">Timeline</TableHead>
                  <TableHead className="w-[15%] text-left font-black uppercase text-[10px] tracking-wider text-zinc-500 p-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-zinc-400 font-medium italic">
                      No project proposals found. Use the button above to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  projectsData.map((p) => (
                    <TableRow key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 transition-colors">
                      <TableCell className="py-5 pl-6 font-bold">
                        <Link href={`/dashboard/professor/projects/${p.id}`} className="text-zinc-900 dark:text-zinc-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors block">
                          <span className="block text-sm font-black uppercase tracking-tight">{p.name}</span>
                          <span className="block text-[10px] text-zinc-400 font-medium truncate max-w-sm mt-0.5">
                            {p.description || "No description provided."}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="py-5 px-4">
                        {getStatusBadge(p.status)}
                      </TableCell>
                      <TableCell className="py-5 text-center px-4">
                        <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                          {p.teamsCount} / {p.maxGroups}
                        </span>
                      </TableCell>
                      <TableCell className="py-5 text-xs font-bold text-zinc-600 dark:text-zinc-400 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-3 text-zinc-400 shrink-0" />
                            Start: {p.dateStart ? p.dateStart.split("-").reverse().join("/") : "TBD"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CheckCircle className="size-3 text-zinc-400 shrink-0" />
                            End: {p.dateEnd ? p.dateEnd.split("-").reverse().join("/") : "TBD"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 text-left px-4">
                        <Link href={`/dashboard/professor/projects/${p.id}`} className="inline-flex items-center justify-center gap-1 h-9 px-3.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black hover:bg-purple-600 dark:hover:bg-purple-700 hover:text-white dark:hover:text-white font-black uppercase text-[10px] tracking-wider transition-all active:scale-[0.97]">
                          Manage
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
