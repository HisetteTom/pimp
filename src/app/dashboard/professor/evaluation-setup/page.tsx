import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { project, evaluationCriterion } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Metadata } from "next";
import Link from "next/link";
import { CriteriaManager } from "./criteria-manager";

export const metadata: Metadata = {
  title: "Evaluation Grid Setup - PIMP",
  description: "Configure evaluation grids and custom scoring criteria for student projects.",
};

export default async function EvaluationSetupPage() {
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
              You must be logged in as a professor to access this configuration panel.
            </p>
            <Link href="/login" className="inline-block px-5 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-black uppercase tracking-wider text-xs transition-transform active:scale-95">
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch all projects and evaluation criteria in parallel
  const [allProjects, allCriteria] = await Promise.all([
    db.select().from(project),
    db.select().from(evaluationCriterion),
  ]);

  // Format projects list for the sidebar layout
  const sidebarProjects = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <DashboardLayout userProjects={sidebarProjects}>
      <div className="space-y-6">
        <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-5">
          <h1 className="text-2xl font-semibold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
            Evaluation Grid Setup
          </h1>
          <p className="text-xs font-medium text-zinc-400">
            Design and establish customized grading rubrics, scoring criteria, and weights for oral defenses and project deliverables.
          </p>
        </div>

        <CriteriaManager
          projects={allProjects}
          initialCriteria={allCriteria}
        />
      </div>
    </DashboardLayout>
  );
}
