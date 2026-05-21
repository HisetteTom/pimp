import { db } from "../src/db";
import { user, account, session, verification } from "../src/db/schema/auth";
import { project } from "../src/db/schema/project";
import { team } from "../src/db/schema/team";
import { task } from "../src/db/schema/task";
import { livrable } from "../src/db/schema/livrable";
import { comment } from "../src/db/schema/comment";
import { refusedProject } from "../src/db/schema/refused_project";
import { projectEnrollment } from "../src/db/schema/project_enrollment";
import { compte } from "../src/db/schema/compte";
import { responsability } from "../src/db/schema/responsability";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import "dotenv/config";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  console.log("Cleaning database...");
  // Level 1 -> Level 2 -> Level 3: Delete sequentially using a single await chain to satisfy FK constraints and linter rules
  await Promise.all([
    db.delete(comment),
    db.delete(task),
    db.delete(livrable),
    db.delete(projectEnrollment),
    db.delete(refusedProject),
    db.delete(compte),
    db.delete(session),
    db.delete(account),
    db.delete(verification),
  ])
    .then(() =>
      Promise.all([
        db.delete(team),
        db.delete(responsability),
      ])
    )
    .then(() =>
      Promise.all([
        db.delete(user),
        db.delete(project),
      ])
    );
  
  console.log("Database cleaned.");

  const [passwordHash, profPasswordHash] = await Promise.all([
    bcrypt.hash("etudiant", 10),
    bcrypt.hash("professeur", 10)
  ]);

  const studentId = crypto.randomUUID();
  const profId = crypto.randomUUID();

  // Combine user and account inserts if possible, or at least keep them parallelized
  await Promise.all([
    db.insert(user).values({
      id: studentId,
      name: "Étudiant Test",
      email: "etudiant@test.com",
      username: "etudiant",
      role: "student",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    db.insert(user).values({
      id: profId,
      name: "Professeur Test",
      email: "prof@test.com",
      username: "professeur",
      role: "professor",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  ]);

  await Promise.all([
    db.insert(account).values({
      id: crypto.randomUUID(),
      userId: studentId,
      accountId: studentId,
      providerId: "credential",
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    db.insert(account).values({
      id: crypto.randomUUID(),
      userId: profId,
      accountId: profId,
      providerId: "credential",
      password: profPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  ]);

  const projectsData = [];
  for (let i = 0; i < 5; i++) {
    projectsData.push({
      name: faker.company.catchPhrase(),
      description: faker.lorem.paragraphs(2),
      status: i < 2 ? "assigned" : "proposed",
      dateStart: faker.date.soon().toISOString().split('T')[0],
      dateEnd: faker.date.future().toISOString().split('T')[0],
      maxGroups: 8,
      maxMembersPerGroup: 5
    });
  }

  const insertedProjects = await db.insert(project).values(projectsData).returning();

  // Create some teams for assigned projects
  const teamsData = [];
  for (const p of insertedProjects) {
    if (p.status === "assigned") {
      // Add 1-2 teams per assigned project
      const numTeams = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < numTeams; j++) {
        teamsData.push({
          name: `Team ${j + 1} - ${p.name.substring(0, 10)}`,
          projectId: p.id
        });
      }
    }
  }

  const insertedTeams = await db.insert(team).values(teamsData).returning();

  // Assign test student to some projects via projectEnrollment
  const assignedProject = insertedProjects.find(p => p.status === "assigned");
  if (assignedProject) {
    const assignedTeam = insertedTeams.find(t => t.projectId === assignedProject.id);
    
    await db.insert(projectEnrollment).values({
      userId: studentId,
      projectId: assignedProject.id,
      teamId: assignedTeam?.id
    });
  }

  // Also assign to one "proposed" project as a member (no team yet)
  const proposedProject = insertedProjects.find(p => p.status === "proposed");
  if (proposedProject) {
    await db.insert(projectEnrollment).values({
      userId: studentId,
      projectId: proposedProject.id,
    });
  }

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
