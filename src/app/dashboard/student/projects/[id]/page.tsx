import { db } from "@/db";
import { project, team, user, task, livrable, projectEnrollment } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TeamSelection } from "./team-selection";
import { ProjectDashboard } from "./project-dashboard";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = parseInt(id);

  if (isNaN(projectId)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [projectData, currentUser, allTeams, allEnrollments, userEnrollments] = await Promise.all([
    db.query.project.findFirst({
      where: eq(project.id, projectId),
    }),
    db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    }),
    db.query.team.findMany({
      where: eq(team.projectId, projectId),
    }),
    db.select().from(projectEnrollment).where(eq(projectEnrollment.projectId, projectId)),
    db.select().from(projectEnrollment).where(eq(projectEnrollment.userId, session.user.id))
  ]);

  if (!projectData) {
    notFound();
  }

  // Fetch users for this project based on enrollments
  const enrolledUserIds = allEnrollments.map(e => e.userId);
  const projectUsers = enrolledUserIds.length > 0 
    ? await db.query.user.findMany({ where: inArray(user.id, enrolledUserIds) }) 
    : [];

  const userMap = new Map(projectUsers.map(u => [u.id, u]));

  // Index members by team
  const membersByTeam = new Map<number, typeof projectUsers>();
  for (const e of allEnrollments) {
    if (!e.teamId) continue;
    const u = userMap.get(e.userId);
    if (!u) continue;
    const list = membersByTeam.get(e.teamId) || [];
    list.push(u);
    membersByTeam.set(e.teamId, list);
  }

  const teamsWithMembers = allTeams.map(t => ({
    ...t,
    members: membersByTeam.get(t.id) || []
  }));

  const currentEnrollment = userEnrollments.find(e => e.projectId === projectId);
  const userTeam = currentEnrollment?.teamId 
    ? teamsWithMembers.find(t => t.id === currentEnrollment.teamId) 
    : null;

  // Prepare sidebar data: all active projects for the user
  const activeProjectIds = userEnrollments.map(e => e.projectId);
  const activeProjects = activeProjectIds.length > 0
    ? await db.query.project.findMany({ where: inArray(project.id, activeProjectIds) })
    : [];
  
  // Also need teams for these projects to show team names in sidebar
  const activeTeamIds = userEnrollments.flatMap(e => e.teamId ? [e.teamId] : []);
  const activeTeams = activeTeamIds.length > 0
    ? await db.query.team.findMany({ where: inArray(team.id, activeTeamIds) })
    : [];

  const teamMap = new Map(activeTeams.map(t => [t.id, t]));

  const userProjectsData = activeProjects.map(p => {
    const enroll = userEnrollments.find(e => e.projectId === p.id);
    const t = enroll?.teamId ? teamMap.get(enroll.teamId) : null;
    return {
      id: p.id,
      name: p.name,
      teamName: t?.name
    };
  });

  let teamTasks: any[] = [];
  let teamLivrables: any[] = [];

  if (userTeam) {
    [teamTasks, teamLivrables] = await Promise.all([
      db.query.task.findMany({
        where: eq(task.teamId, userTeam.id),
      }),
      db.query.livrable.findMany({
        where: eq(livrable.teamId, userTeam.id),
      })
    ]);
  }

  return (
    <DashboardLayout 
      userProjects={userProjectsData}
      team={userTeam ? { id: userTeam.id, projectId: userTeam.projectId, name: userTeam.name, members: userTeam.members } : undefined}
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">
            {projectData.name}
          </h1>
        </div>

        {!userTeam ? (
          <TeamSelection 
            projectId={projectId} 
            teams={teamsWithMembers} 
            maxGroups={projectData.maxGroups}
            maxMembers={projectData.maxMembersPerGroup}
          />
        ) : (
          <ProjectDashboard 
            project={projectData}
            team={userTeam}
            currentUser={currentUser!}
            tasks={teamTasks}
            livrables={teamLivrables}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
