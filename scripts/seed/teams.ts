import { db } from "./db";
import { team } from "../../src/db/schema/team";
import { user } from "../../src/db/schema/auth";
import { projectEnrollment } from "../../src/db/schema/project_enrollment";
import { faker } from "@faker-js/faker";
import { inArray } from "drizzle-orm";

interface SeedTeamsProps {
  insertedProjects: any[];
  studentTestId: string;
  randomStudentIds: string[];
}

export async function seedTeams({ insertedProjects, studentTestId, randomStudentIds }: SeedTeamsProps) {
  console.log("Populating active student teams…");
  const getInt = faker.number.int.bind(faker.number);

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

  console.log("Enrolling students and structuring groups…");
  const enrollmentsToInsert = [];
  const leaderUserIds = new Set<string>();

  // Assign our test student to an ongoing project team as leader
  const targetProject = insertedProjects.find(p => p.status === "ongoing");
  const targetTeam = targetProject ? insertedTeams.find(t => t.projectId === targetProject.id) : null;

  if (targetProject && targetTeam) {
    enrollmentsToInsert.push({
      userId: studentTestId,
      projectId: targetProject.id,
      teamId: targetTeam.id,
    });
    leaderUserIds.add(studentTestId);
  }

  // Assign random students to teams (each student in only one team)
  let studentIndex = 0;
  for (const t of insertedTeams) {
    const teamSize = getInt({ min: 3, max: 4 });
    const currentTeamMembers = enrollmentsToInsert.filter(e => e.teamId === t.id);
    let membersToAdd = teamSize - currentTeamMembers.length;
    let isFirstMember = currentTeamMembers.length === 0;

    for (let m = 0; m < membersToAdd; m++) {
      if (studentIndex < randomStudentIds.length) {
        const studentId = randomStudentIds[studentIndex++];
        if (isFirstMember) {
          leaderUserIds.add(studentId);
          isFirstMember = false;
        }
        enrollmentsToInsert.push({
          userId: studentId,
          projectId: t.projectId,
          teamId: t.id,
        });
      }
    }
  }

  await db.insert(projectEnrollment).values(enrollmentsToInsert);

  if (leaderUserIds.size > 0) {
    await db.update(user)
      .set({ responsabilityId: 1 })
      .where(inArray(user.id, Array.from(leaderUserIds)));
  }

  // Add remaining students to idle projects (without teams)
  const idleProjects = insertedProjects.filter(p => p.status === "proposed" || p.status === "validated");
  for (const p of idleProjects) {
    const idleCount = getInt({ min: 1, max: 2 });
    for (let c = 0; c < idleCount; c++) {
      if (studentIndex < randomStudentIds.length) {
        enrollmentsToInsert.push({
          userId: randomStudentIds[studentIndex++],
          projectId: p.id,
          teamId: null,
        });
      }
    }
  }

  return {
    insertedTeams,
    enrollmentsToInsert
  };
}
