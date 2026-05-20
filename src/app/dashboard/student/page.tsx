import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { project, user, refusedProject, team, projectEnrollment } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Manage your projects and track your progress on PIMP.",
};

export default async function StudentDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Unauthorized</div>;
  }

  const [currentUser, allProjects, allUsers, refused, allTeams, userEnrollments] = await Promise.all([
    db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    }),
    db.select().from(project),
    db.select().from(user),
    db.select().from(refusedProject).where(eq(refusedProject.userId, session.user.id)),
    db.select().from(team),
    db.select().from(projectEnrollment).where(eq(projectEnrollment.userId, session.user.id))
  ]);

  const refusedIds = new Set(refused.map((r) => r.projectId));
  const enrolledProjectIds = new Set(userEnrollments.map(e => e.projectId));
  const enrollmentMap = new Map(userEnrollments.map(e => [e.projectId, e]));

  // Index teams by project ID
  const teamsByProject = new Map<number, number>();
  for (const t of allTeams) {
    teamsByProject.set(t.projectId, (teamsByProject.get(t.projectId) || 0) + 1);
  }

  // Pre-index members by project ID for O(1) lookup
  // We need to fetch ALL enrollments to count members correctly per project
  const allEnrollments = await db.select().from(projectEnrollment);
  const enrollmentsByProject = new Map<number, typeof allEnrollments>();
  for (const e of allEnrollments) {
    const list = enrollmentsByProject.get(e.projectId) || [];
    list.push(e);
    enrollmentsByProject.set(e.projectId, list);
  }

  const userMap = new Map(allUsers.map(u => [u.id, u]));
  const teamsById = new Map(allTeams.map(t => [t.id, t]));

  const myProjects: (typeof allProjects[0] & { membersList: any[] })[] = [];
  const proposedProjects: (typeof allProjects[0] & { membersList: any[] })[] = [];

  for (const p of allProjects) {
    if (refusedIds.has(p.id)) continue;

    const projectEnrollments = enrollmentsByProject.get(p.id) || [];
    const membersList = projectEnrollments.map(e => {
        const u = userMap.get(e.userId);
        return {
            id: e.userId,
            name: u?.name || "Unknown",
            image: u?.image || null
        };
    });
    
    if (enrolledProjectIds.has(p.id)) {
      myProjects.push({ ...p, membersList });
    } else if (p.status === "proposed") {
      proposedProjects.push({ ...p, membersList });
    }
  }

  const userProjectsData = myProjects.map(p => {
    const enrollment = enrollmentMap.get(p.id);
    const userTeam = enrollment?.teamId ? teamsById.get(enrollment.teamId) : null;
    return {
      id: p.id,
      name: p.name,
      teamName: userTeam?.name
    };
  });

  return (
    <DashboardLayout userProjects={userProjectsData}>
      <div className="space-y-10 pb-10">
        <div id="top" className="scroll-mt-10">
          <h1 className="text-4xl font-semibold tracking-tighter text-secondary uppercase">
            My Dashboard
          </h1>
        </div>

        {/* Section: My Projects */}
        <section id="my-projects" className="space-y-4 scroll-mt-10">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-secondary uppercase tracking-tight">My Projects</h2>
            <div className="h-px flex-1 bg-secondary/10" />
            <Badge className="bg-secondary text-secondary-foreground font-black">{myProjects.length}</Badge>
          </div>
          
          {myProjects.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-secondary/10 rounded-xl bg-secondary/5 text-center">
              <p className="text-muted-foreground font-medium italic">You are not yet assigned to a project.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {myProjects.map((p) => (
                <ProjectCard 
                  key={p.id} 
                  id={p.id}
                  title={p.name} 
                  description={p.description || ""} 
                  fullDescription={p.description || ""}
                  status={p.status} 
                  dateStart={p.dateStart || undefined}
                  dateEnd={p.dateEnd || undefined}
                  deadline={p.dateEnd || "Not defined"} 
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
        <section id="proposals" className="space-y-4 scroll-mt-10">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-primary uppercase tracking-tight">Proposals</h2>
            <div className="h-px flex-1 bg-primary/10" />
            <Badge className="bg-primary text-primary-foreground font-black">{proposedProjects.length}</Badge>
          </div>

          {proposedProjects.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-primary/10 rounded-xl bg-primary/5 text-center">
              <p className="text-muted-foreground font-medium italic">No proposals available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {proposedProjects.map((p) => (
                <ProjectCard 
                  key={p.id} 
                  id={p.id}
                  title={p.name} 
                  description={p.description || ""} 
                  fullDescription={p.description || ""}
                  status={p.status} 
                  dateStart={p.dateStart || undefined}
                  dateEnd={p.dateEnd || undefined}
                  deadline={p.dateEnd || "Not defined"} 
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
