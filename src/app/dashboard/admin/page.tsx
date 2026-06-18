import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { db } from '@/db';
import { project, user, team } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { AccessDenied } from '../professor/_components/access-denied';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '../professor/_components/status-badge';
import Link from 'next/link';
import { FolderRoot, Users, GraduationCap, UserCheck, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Admin Dashboard - PIMP',
  description: 'Global control center of all projects, teams, students, and professors.',
};

/**
 * Global administrator cockpit dashboard view. Displays platform statistics,
 * user distributions, and ongoing academic projects.
 */
export default async function AdminDashboardPage() {
  const [t, session] = await Promise.all([
    getTranslations('AdminDashboard'),
    headers().then((h) => auth.api.getSession({ headers: h })),
  ]);

  if (!session || session.user.role !== 'admin') {
    return <AccessDenied />;
  }

  // Fetch stats and lists in parallel
  const [allProjects, allTeams, allUsers] = await Promise.all([
    db.select().from(project),
    db.select().from(team),
    db.select().from(user),
  ]);

  // Calculations
  const totalProjects = allProjects.length;
  const totalTeams = allTeams.length;
  const totalStudents = allUsers.filter((u) => u.role === 'student').length;
  const totalTeachers = allUsers.filter((u) => u.role === 'professor').length;

  const teamsByProject = new Map<number, typeof allTeams>();
  for (const t of allTeams) {
    const list = teamsByProject.get(t.projectId) || [];
    list.push(t);
    teamsByProject.set(t.projectId, list);
  }

  const projectsData = allProjects.map((p) => {
    const projTeams = teamsByProject.get(p.id) || [];
    return {
      ...p,
      teamsCount: projTeams.length,
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
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 uppercase dark:text-zinc-100">
            {t('title')}
          </h1>
          <p className="mt-1 text-xs font-bold tracking-widest text-zinc-400 uppercase">
            {t('subtitle')}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
              <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                {t('totalProjects')}
              </span>
              <FolderRoot className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">
                {totalProjects}
              </div>
              <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                {t('projectsSub')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
              <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                {t('totalTeams')}
              </span>
              <Users className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">
                {totalTeams}
              </div>
              <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                {t('teamsSub')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
              <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                {t('totalStudents')}
              </span>
              <GraduationCap className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">
                {totalStudents}
              </div>
              <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                {t('studentsSub')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card rounded-none border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
              <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                {t('totalProfessors')}
              </span>
              <UserCheck className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-zinc-950 dark:text-zinc-50">
                {totalTeachers}
              </div>
              <p className="mt-1 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                {t('professorsSub')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
              {t('projectsAdmin')}
            </h2>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <Badge className="rounded-none bg-zinc-900 font-black text-white dark:bg-zinc-100 dark:text-zinc-900">
              {totalProjects}
            </Badge>
          </div>

          <Card className="bg-card overflow-hidden rounded-none border-2 border-zinc-200 dark:border-zinc-800">
            <Table>
              <TableHeader className="border-b-2 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40%] py-4 pl-6 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                    {t('colSubject')}
                  </TableHead>
                  <TableHead className="w-[15%] p-4 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                    {t('colStatus')}
                  </TableHead>
                  <TableHead className="w-[15%] p-4 text-center text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                    {t('colTeams')}
                  </TableHead>
                  <TableHead className="w-[15%] p-4 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                    {t('colTargetPromos')}
                  </TableHead>
                  <TableHead className="w-[15%] p-4 text-left text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                    {t('colAction')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center font-medium text-zinc-400 italic"
                    >
                      {t('noProjects')}
                    </TableCell>
                  </TableRow>
                ) : (
                  projectsData.map((p) => (
                    <TableRow
                      key={p.id}
                      className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                    >
                      <TableCell className="py-5 pl-6 font-bold">
                        <Link
                          href={`/dashboard/admin/projects/${p.id}`}
                          className="block text-zinc-900 transition-colors hover:text-purple-600 dark:text-zinc-100 dark:hover:text-purple-400"
                        >
                          <span className="block text-sm font-black tracking-tight uppercase">
                            {p.name}
                          </span>
                          <span className="mt-0.5 block max-w-md truncate text-[10px] font-medium text-zinc-400">
                            {p.description || t('noDescription')}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 py-5">
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="px-4 py-5 text-center">
                        <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                          {p.teamsCount} / {p.maxGroups}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-5">
                        <div className="flex flex-wrap gap-1">
                          {p.targetPromos.map((pr) => (
                            <Badge
                              key={pr}
                              variant="outline"
                              className="rounded-none text-[8px] font-black tracking-tighter"
                            >
                              {pr}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-5 text-left">
                        <Link
                          href={`/dashboard/admin/projects/${p.id}`}
                          className="inline-flex h-9 items-center justify-center gap-1 bg-zinc-900 px-3.5 text-[10px] font-black tracking-wider text-white uppercase transition-all hover:bg-purple-600 hover:text-white active:scale-[0.97] dark:bg-zinc-100 dark:text-black dark:hover:bg-purple-700 dark:hover:text-white"
                        >
                          {t('controlCenter')}
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
