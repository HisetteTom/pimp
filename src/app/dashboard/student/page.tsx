import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProjectCard } from '@/components/dashboard/project-card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/db';
import { project, user, refusedProject, team, projectEnrollment } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Student Dashboard',
  description: 'Manage your projects and track your progress on PIMP.',
};

export default async function StudentDashboardPage() {
  const [t, session] = await Promise.all([
    getTranslations('Dashboard'),
    headers().then((h) => auth.api.getSession({ headers: h })),
  ]);

  if (!session) {
    return <div>{t('unauthorized')}</div>;
  }

  const [allProjects, allUsers, refused, allTeams, userEnrollments, allEnrollments] =
    await Promise.all([
      db.select().from(project),
      db.select().from(user),
      db.select().from(refusedProject).where(eq(refusedProject.userId, session.user.id)),
      db.select().from(team),
      db.select().from(projectEnrollment).where(eq(projectEnrollment.userId, session.user.id)),
      db.select().from(projectEnrollment),
    ]);

  const refusedIds = new Set(refused.map((r) => r.projectId));
  const enrolledProjectIds = new Set(userEnrollments.map((e) => e.projectId));
  const enrollmentMap = new Map(userEnrollments.map((e) => [e.projectId, e]));

  // Index teams by project ID
  const teamsByProject = new Map<number, number>();
  for (const t of allTeams) {
    teamsByProject.set(t.projectId, (teamsByProject.get(t.projectId) || 0) + 1);
  }

  // Pre-index members by project ID for O(1) lookup
  const enrollmentsByProject = new Map<number, typeof allEnrollments>();
  for (const e of allEnrollments) {
    const list = enrollmentsByProject.get(e.projectId) || [];
    list.push(e);
    enrollmentsByProject.set(e.projectId, list);
  }

  const userMap = new Map(allUsers.map((u) => [u.id, u]));
  const teamsById = new Map(allTeams.map((t) => [t.id, t]));

  const userPromo = (session.user as typeof session.user & { promo?: string }).promo || '';

  const myProjects: ((typeof allProjects)[0] & {
    membersList: { id: string; name: string; image: string | null }[];
  })[] = [];
  const proposedProjects: ((typeof allProjects)[0] & {
    membersList: { id: string; name: string; image: string | null }[];
  })[] = [];

  for (const p of allProjects) {
    if (refusedIds.has(p.id)) continue;

    const targetPromosSet = new Set(p.targetPromos || []);
    const targetUsersSet = new Set(p.targetUsers || []);
    const isTargeted = targetPromosSet.has(userPromo) || targetUsersSet.has(session.user.id);

    if (!isTargeted) continue;

    const projectEnrollments = enrollmentsByProject.get(p.id) || [];
    const membersList = projectEnrollments.map((e) => {
      const u = userMap.get(e.userId);
      return {
        id: e.userId,
        name: u?.name || 'Unknown',
        image: u?.image || null,
      };
    });

    if (enrolledProjectIds.has(p.id)) {
      myProjects.push({ ...p, membersList });
    } else if (p.status === 'proposed') {
      proposedProjects.push({ ...p, membersList });
    }
  }

  const userProjectsData = myProjects.map((p) => {
    const enrollment = enrollmentMap.get(p.id);
    const userTeam = enrollment?.teamId ? teamsById.get(enrollment.teamId) : null;
    return {
      id: p.id,
      name: p.name,
      teamName: userTeam?.name,
    };
  });

  return (
    <DashboardLayout userProjects={userProjectsData}>
      <div className="space-y-10 pb-10">
        <div id="top" className="scroll-mt-10">
          <h1 className="text-secondary text-4xl font-semibold tracking-tighter uppercase">
            {t('title')}
          </h1>
        </div>

        {/* Section: My Projects */}
        <section id="my-projects" className="scroll-mt-10 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-secondary text-2xl font-semibold tracking-tight uppercase">
              {t('myProjects')}
            </h2>
            <div className="bg-secondary/10 h-px flex-1" />
            <Badge className="bg-secondary text-secondary-foreground font-black">
              {myProjects.length}
            </Badge>
          </div>

          {myProjects.length === 0 ? (
            <div className="border-secondary/10 bg-secondary/5 rounded-xl border-2 border-dashed p-8 text-center">
              <p className="text-muted-foreground font-medium italic">{t('noProjects')}</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {myProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  description={p.description || ''}
                  fullDescription={p.description || ''}
                  status={p.status}
                  dateStart={p.dateStart || undefined}
                  dateEnd={p.dateEnd || undefined}
                  deadline={p.dateEnd || t('notDefined')}
                  groups={teamsByProject.get(p.id) || 0}
                  maxGroups={p.maxGroups}
                  membersList={p.membersList}
                  isMember={true}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section: Proposals */}
        <section id="proposals" className="scroll-mt-10 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-primary text-2xl font-semibold tracking-tight uppercase">
              {t('proposals')}
            </h2>
            <div className="bg-primary/10 h-px flex-1" />
            <Badge className="bg-primary text-primary-foreground font-black">
              {proposedProjects.length}
            </Badge>
          </div>

          {proposedProjects.length === 0 ? (
            <div className="border-primary/10 bg-primary/5 rounded-xl border-2 border-dashed p-8 text-center">
              <p className="text-muted-foreground font-medium italic">{t('noProposals')}</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {proposedProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  description={p.description || ''}
                  fullDescription={p.description || ''}
                  status={p.status}
                  dateStart={p.dateStart || undefined}
                  dateEnd={p.dateEnd || undefined}
                  deadline={p.dateEnd || t('notDefined')}
                  groups={teamsByProject.get(p.id) || 0}
                  maxGroups={p.maxGroups}
                  membersList={p.membersList}
                  isMember={false}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
