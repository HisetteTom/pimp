import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CreateTeacherDialog } from './create-teacher-dialog';
import { db } from '@/db';
import { user, project } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { AccessDenied } from '../../professor/_components/access-denied';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { eq } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'Professors Administration - PIMP',
  description: 'View and create professor/teacher accounts.',
};

export default async function AdminTeachersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    return <AccessDenied />;
  }

  // Fetch all professors and all projects for sidebar
  const [professors, allProjects] = await Promise.all([
    db.select().from(user).where(eq(user.role, 'professor')),
    db.select().from(project),
  ]);

  const userProjectsData = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <DashboardLayout userProjects={userProjectsData}>
      <div className="space-y-10 pb-10">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 uppercase dark:text-zinc-100">
              Professors Administration
            </h1>
            <p className="mt-1 text-xs font-bold tracking-widest text-zinc-400 uppercase">
              Manage accounts for teachers, cohort leaders, and evaluators.
            </p>
          </div>
          <CreateTeacherDialog />
        </div>

        {/* Professors Table */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
              Professor Accounts
            </h2>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <Badge className="rounded-none bg-zinc-900 font-black text-white dark:bg-zinc-100 dark:text-zinc-900">
              {professors.length}
            </Badge>
          </div>

          <Card className="bg-card overflow-hidden rounded-none border-2 border-zinc-200 dark:border-zinc-800">
            <Table>
              <TableHeader className="border-b-2 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[45%] py-4 pl-6 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                    Full Name
                  </TableHead>
                  <TableHead className="w-[35%] p-4 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                    Email Address
                  </TableHead>
                  <TableHead className="w-[20%] p-4 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
                    Date Created
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-32 text-center font-medium text-zinc-400 italic"
                    >
                      No professor accounts found. Use the button above to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  professors.map((prof) => (
                    <TableRow
                      key={prof.id}
                      className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                    >
                      <TableCell className="flex items-center gap-3 py-4 pl-6 font-bold">
                        <div className="flex size-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-black text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {prof.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
                          {prof.name}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                        {prof.email}
                      </TableCell>
                      <TableCell className="p-4 text-xs text-zinc-500">
                        {prof.createdAt ? new Date(prof.createdAt).toLocaleDateString() : 'N/A'}
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
