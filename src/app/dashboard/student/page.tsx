import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { project, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Étudiant | PIMP",
  description: "Gérez vos projets et suivez votre progression sur PIMP.",
};

export default async function StudentDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Non autorisé</div>;
  }

  const [currentUser, allProjects, allUsers] = await Promise.all([
    db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    }),
    db.select().from(project),
    db.select().from(user)
  ]);

  // Pre-index members by project ID for O(1) lookup
  const membersByProject = new Map<number | null, { id: string, name: string, image: string | null }[]>();
  for (const u of allUsers) {
    if (!u.projectId) continue;
    const list = membersByProject.get(u.projectId) || [];
    list.push({ id: u.id, name: u.name, image: u.image });
    membersByProject.set(u.projectId, list);
  }
  
  const myProjects: (typeof allProjects[0] & { membersList: { id: string, name: string, image: string | null }[] })[] = [];
  const proposedProjects: (typeof allProjects[0] & { membersList: { id: string, name: string, image: string | null }[] })[] = [];

  for (const p of allProjects) {
    const projectMembers = membersByProject.get(p.id) || [];
    
    if (p.id === currentUser?.projectId) {
      myProjects.push({ ...p, membersList: projectMembers });
    } else if (p.status === "proposed") {
      proposedProjects.push({ ...p, membersList: projectMembers });
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-10">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter text-secondary">
            Mon Dashboard
          </h1>
        </div>

        {/* Section: Mes Projets */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-secondary uppercase tracking-tight">Mes Projets</h2>
            <div className="h-px flex-1 bg-secondary/10" />
            <Badge className="bg-secondary text-secondary-foreground font-black">{myProjects.length}</Badge>
          </div>
          
          {myProjects.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-secondary/10 rounded-xl bg-secondary/5 text-center">
              <p className="text-muted-foreground font-medium italic">Tu n'es pas encore assigné à un projet.</p>
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
                  deadline={p.dateEnd || "Non définie"} 
                  members={p.membersList.length} 
                  membersList={p.membersList}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section: Propositions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-primary uppercase tracking-tight">Propositions</h2>
            <div className="h-px flex-1 bg-primary/10" />
            <Badge className="bg-primary text-primary-foreground font-black">{proposedProjects.length}</Badge>
          </div>

          {proposedProjects.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-primary/10 rounded-xl bg-primary/5 text-center">
              <p className="text-muted-foreground font-medium italic">Aucune proposition disponible pour le moment.</p>
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
                  deadline={p.dateEnd || "Non définie"} 
                  members={p.membersList.length} 
                  membersList={p.membersList}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
