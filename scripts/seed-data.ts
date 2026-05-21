import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
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

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment variables");
}

const client = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(client);

async function seed() {
  console.log("Seeding database...");

  const getInt = faker.number.int.bind(faker.number);

  console.log("Cleaning database...");
  // Satisfy FK constraint delete order using chained promises to avoid sequential awaits
  await Promise.all([
    db.delete(comment),
    db.delete(task),
    db.delete(livrable),
    db.delete(projectEnrollment),
    db.delete(refusedProject),
    db.delete(compte),
    db.delete(session),
  ])
    .then(() => Promise.all([
      db.delete(account),
      db.delete(verification),
      db.delete(team),
      db.delete(responsability),
    ]))
    .then(() => Promise.all([
      db.delete(user),
      db.delete(project),
    ]));
  
  console.log("Database cleaned.");

  console.log("Hashing passwords…");
  const [studentPasswordHash, profPasswordHash] = await Promise.all([
    bcrypt.hash("etudiant", 10),
    bcrypt.hash("professeur", 10)
  ]);

  const studentTestId = crypto.randomUUID();
  const profTestId = crypto.randomUUID();

  // Create core test users
  await db.insert(user).values([
    {
      id: studentTestId,
      name: "Student Test",
      email: "etudiant@test.com",
      username: "etudiant",
      role: "student",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: profTestId,
      name: "Professor Test",
      email: "prof@test.com",
      username: "professeur",
      role: "professor",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  await db.insert(account).values([
    {
      id: crypto.randomUUID(),
      userId: studentTestId,
      accountId: studentTestId,
      providerId: "credential",
      password: studentPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      userId: profTestId,
      accountId: profTestId,
      providerId: "credential",
      password: profPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  // Generate 20 random students using Faker
  console.log("Generating 20 random student accounts…");
  const randomStudentIds: string[] = [];
  const studentsToInsert = [];
  const accountsToInsert = [];

  for (let i = 0; i < 20; i++) {
    const sId = crypto.randomUUID();
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(" ")[0] }).toLowerCase();
    const username = faker.internet.username({ firstName: name.split(" ")[0] }).toLowerCase();

    studentsToInsert.push({
      id: sId,
      name,
      email,
      username,
      role: "student",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    accountsToInsert.push({
      id: crypto.randomUUID(),
      userId: sId,
      accountId: sId,
      providerId: "credential",
      password: studentPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    randomStudentIds.push(sId);
  }

  // Generate 3 random professors using Faker
  console.log("Generating 3 random professor accounts…");
  const profIds = [profTestId];
  for (let i = 0; i < 3; i++) {
    const pId = crypto.randomUUID();
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(" ")[0] }).toLowerCase();
    const username = faker.internet.username({ firstName: name.split(" ")[0] }).toLowerCase();

    studentsToInsert.push({
      id: pId,
      name,
      email,
      username,
      role: "professor",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    accountsToInsert.push({
      id: crypto.randomUUID(),
      userId: pId,
      accountId: pId,
      providerId: "credential",
      password: profPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    profIds.push(pId);
  }

  await db.insert(user).values(studentsToInsert);
  await db.insert(account).values(accountsToInsert);

  // Generate 9 distinct project templates
  console.log("Creating 9 realistic projects…");
  const projectsData = [
    {
      name: "Autonomous Drone Delivery System",
      description: "Build an autonomous pathfinding algorithm for package delivery drones in low-altitude urban airspaces, complete with landing pad detection.",
      status: "proposed",
      dateStart: "2026-06-01",
      dateEnd: "2026-09-30",
      maxGroups: 6,
      maxMembersPerGroup: 4,
    },
    {
      name: "Decentralized Carbon Offset Registry",
      description: "Design a decentralized platform utilizing smart contracts to track, audit, and trade greenhouse gas emission tokens transparently.",
      status: "proposed",
      dateStart: "2026-07-15",
      dateEnd: "2026-11-30",
      maxGroups: 5,
      maxMembersPerGroup: 5,
    },
    {
      name: "Smart Traffic Flow Controller",
      description: "Apply computer vision algorithms at intersections to orchestrate traffic signals dynamically, optimizing traffic flows and reducing idle times.",
      status: "validated",
      dateStart: "2026-05-01",
      dateEnd: "2026-08-31",
      maxGroups: 4,
      maxMembersPerGroup: 5,
    },
    {
      name: "AI-Powered Patient Triage Portal",
      description: "Develop a diagnostic support system assisting clinic staff to categorize and prioritize patient queues based on severe symptoms and case history.",
      status: "ongoing",
      dateStart: "2026-03-01",
      dateEnd: "2026-06-30",
      maxGroups: 8,
      maxMembersPerGroup: 4,
    },
    {
      name: "Greenhouse Hydroponic Automator",
      description: "Assemble microcontrollers measuring humidity, light, and mineral feeds, integrating real-time telemetry into a visual analytics control panel.",
      status: "ongoing",
      dateStart: "2026-02-15",
      dateEnd: "2026-06-15",
      maxGroups: 6,
      maxMembersPerGroup: 5,
    },
    {
      name: "Real-Time Microgrid Balancer",
      description: "Model regional electricity networks balancing solar, wind, and storage battery feeds dynamically against consumer load curves.",
      status: "late",
      dateStart: "2026-01-10",
      dateEnd: "2026-05-15",
      maxGroups: 5,
      maxMembersPerGroup: 5,
    },
    {
      name: "Biometric Identity Guard System",
      description: "Develop a multi-factor local credentials gatehouse checking localized face keypoints and hardware verification tags.",
      status: "delivered",
      dateStart: "2025-11-01",
      dateEnd: "2026-04-15",
      maxGroups: 4,
      maxMembersPerGroup: 4,
    },
    {
      name: "Augmented Reality Museum Guide",
      description: "Create an interactive mobile viewport rendering localized historical scenes and artifacts over existing museum halls.",
      status: "presented",
      dateStart: "2025-09-01",
      dateEnd: "2026-03-31",
      maxGroups: 6,
      maxMembersPerGroup: 5,
    },
    {
      name: "Secure Remote Voting Module",
      description: "A secure protocol leveraging zero-knowledge proofs to allow secure voting while preserving strict voter privacy.",
      status: "closed",
      dateStart: "2025-08-01",
      dateEnd: "2026-02-01",
      maxGroups: 4,
      maxMembersPerGroup: 5,
    }
  ];

  const insertedProjects = await db.insert(project).values(projectsData).returning();

  // Create teams for active/late/delivered/presented/closed projects
  console.log("Populating active student teams…");
  const activeProjects = insertedProjects.filter(p => 
    new Set(["ongoing", "late", "delivered", "presented", "closed"]).has(p.status)
  );

  const teamNames = [
    "SmarTraffix", "SyncGrid", "EcoTrackers", "NeuroVision", "HelixTech",
    "ApexLabs", "ZephyrSystems", "HydraGroup", "ChronosTech", "PulseDevs"
  ];

  const teamsData = [];
  let nameIndex = 0;
  for (const p of activeProjects) {
    // Add 2 teams per project
    for (let j = 0; j < 2; j++) {
      teamsData.push({
        name: `${teamNames[nameIndex % teamNames.length]} - Team ${j + 1}`,
        projectId: p.id,
        grade: p.status === "presented" || p.status === "closed" ? getInt({ min: 12, max: 19 }).toString() : null,
        feedback: p.status === "presented" || p.status === "closed" ? "Impressive delivery, well-structured codebase and solid testing." : null,
      });
      nameIndex++;
    }
  }

  const insertedTeams = await db.insert(team).values(teamsData).returning();

  // Enrolling students to teams
  console.log("Enrolling students and structuring groups…");
  const enrollmentsToInsert = [];
  const enrolledUsersPerProject = new Map<number, Set<string>>();

  // Initialize sets for each project
  for (const p of insertedProjects) {
    enrolledUsersPerProject.set(p.id, new Set<string>());
  }
  
  // Assign our test student to an ongoing project team
  const targetProject = insertedProjects.find(p => p.status === "ongoing");
  const targetTeam = targetProject ? insertedTeams.find(t => t.projectId === targetProject.id) : null;

  if (targetProject && targetTeam) {
    enrollmentsToInsert.push({
      userId: studentTestId,
      projectId: targetProject.id,
      teamId: targetTeam.id,
    });
    enrolledUsersPerProject.get(targetProject.id)?.add(studentTestId);
  }

  // Shuffle students and assign to other active teams
  let studentCursor = 0;
  for (const t of insertedTeams) {
    // Assign 3-4 members per team
    const teamSize = getInt({ min: 3, max: 4 });
    const projectSet = enrolledUsersPerProject.get(t.projectId) || new Set<string>();

    for (let m = 0; m < teamSize; m++) {
      let attempts = 0;
      let candidateId = "";
      
      while (attempts < randomStudentIds.length) {
        const potentialId = randomStudentIds[studentCursor % randomStudentIds.length];
        studentCursor++;
        attempts++;
        if (!projectSet.has(potentialId)) {
          candidateId = potentialId;
          break;
        }
      }

      if (candidateId) {
        projectSet.add(candidateId);
        enrollmentsToInsert.push({
          userId: candidateId,
          projectId: t.projectId,
          teamId: t.id,
        });
      }
    }
  }

  // Add some students enrolled in "proposed" and "validated" projects without teams
  const idleProjects = insertedProjects.filter(p => p.status === "proposed" || p.status === "validated");
  for (const p of idleProjects) {
    const idleCount = getInt({ min: 2, max: 5 });
    const projectSet = enrolledUsersPerProject.get(p.id) || new Set<string>();
    
    for (let c = 0; c < idleCount; c++) {
      let attempts = 0;
      let candidateId = "";
      
      while (attempts < randomStudentIds.length) {
        const potentialId = randomStudentIds[getInt({ min: 0, max: randomStudentIds.length - 1 })];
        attempts++;
        if (!projectSet.has(potentialId)) {
          candidateId = potentialId;
          break;
        }
      }

      if (candidateId) {
        projectSet.add(candidateId);
        enrollmentsToInsert.push({
          userId: candidateId,
          projectId: p.id,
          teamId: null,
        });
      }
    }
  }

  await db.insert(projectEnrollment).values(enrollmentsToInsert);

  // Generate realistic tasks and deliverables per active team
  console.log("Populating realistic tasks and deliverables…");
  const tasksData = [];
  const deliverablesData = [];

  const taskTemplates = [
    { name: "Initial Project Scope Definition", desc: "Define functional requirements, milestones and team responsibilities.", status: "done", priority: "high" },
    { name: "Database Schema Draft", desc: "Design entity relation diagram and write migrations.", status: "done", priority: "medium" },
    { name: "API Architecture Design", desc: "Model RESTful route controllers and structure server schemas.", status: "in_progress", priority: "high" },
    { name: "User Interface Mockups", desc: "Create interactive Figma blueprints for all key dashboard panels.", status: "in_progress", priority: "medium" },
    { name: "Automated Integration Tests", desc: "Configure Jest or Vitest framework suites targeting core backend mutations.", status: "todo", priority: "low" },
    { name: "Docker Deployment Setup", desc: "Compose local containers isolating database and authentication runtimes.", status: "todo", priority: "high" },
  ];

  const deliverableTemplates = [
    { name: "System Architecture Charter", source: "https://example.com/system-charter-v1.pdf", status: "approved", feedback: "Excellent initial layout. High fidelity diagram." },
    { name: "Figma Interface Design PDF", source: "https://example.com/figma-export.pdf", status: "approved", feedback: "Matches standard design rules. Highly accessible." },
    { name: "Working Code Repository ZIP", source: "https://example.com/repo-backup.zip", status: "pending", feedback: null },
    { name: "Deployment Blueprint", source: "https://example.com/docker-deploy.yml", status: "rejected", feedback: "Container ports conflict with local auth configuration. Please fix and resubmit." },
  ];

  for (const t of insertedTeams) {
    // Get team members from enrollments using a single-pass loop
    const teamMembers: string[] = [];
    for (const e of enrollmentsToInsert) {
      if (e.teamId === t.id) {
        teamMembers.push(e.userId);
      }
    }
    
    // Add 4-6 tasks
    const numTasks = getInt({ min: 4, max: 6 });
    for (let k = 0; k < numTasks; k++) {
      const template = taskTemplates[k % taskTemplates.length];
      const assigneeId = teamMembers.length > 0 ? teamMembers[getInt({ min: 0, max: teamMembers.length - 1 })] : null;

      tasksData.push({
        name: template.name,
        description: template.desc,
        status: template.status,
        priority: template.priority,
        teamId: t.id,
        assigneeId,
        createdAt: new Date(),
      });
    }

    // Add 2-3 deliverables
    const numDelivs = getInt({ min: 2, max: 3 });
    for (let d = 0; d < numDelivs; d++) {
      const template = deliverableTemplates[d % deliverableTemplates.length];
      deliverablesData.push({
        name: template.name,
        source: template.source,
        teamId: t.id,
        status: template.status,
        feedback: template.feedback,
        createdAt: new Date(),
      });
    }
  }

  if (tasksData.length > 0) {
    await db.insert(task).values(tasksData);
  }
  if (deliverablesData.length > 0) {
    await db.insert(livrable).values(deliverablesData);
  }

  console.log("Seeding completed!");
  await client.end();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("Seeding failed:", err);
  await client.end();
  process.exit(1);
});
