import { db } from './db';
import { team } from '../../src/db/schema/team';
import { projectEnrollment } from '../../src/db/schema/project_enrollment';
import { faker } from '@faker-js/faker';

interface SeedTeamsProps {
  insertedProjects: any[];
  studentTestId: string;
  student2TestId: string;
  randomStudentIds: string[];
}

export async function seedTeams({
  insertedProjects,
  studentTestId,
  student2TestId,
  randomStudentIds,
}: SeedTeamsProps) {
  console.log('Populating active student teams…');
  const getInt = faker.number.int.bind(faker.number);

  const activeProjects = insertedProjects.filter((p) =>
    new Set(['ongoing', 'late', 'delivered', 'presented', 'closed']).has(p.status),
  );

  const teamNames = [
    'SmarTraffix',
    'SyncGrid',
    'EcoTrackers',
    'NeuroVision',
    'HelixTech',
    'ApexLabs',
    'ZephyrSystems',
    'HydraGroup',
    'ChronosTech',
    'PulseDevs',
  ];

  const teamsData = [];
  let nameIndex = 0;
  for (const p of activeProjects) {
    // Add 5 teams per active project to seed more realistic data
    const numTeams = 5;
    for (let tNum = 1; tNum <= numTeams; tNum++) {
      teamsData.push({
        name: `${teamNames[nameIndex % teamNames.length]} - G${tNum}`,
        projectId: p.id,
        grade:
          p.status === 'presented' || p.status === 'closed'
            ? getInt({ min: 12, max: 19 }).toString()
            : null,
        feedback:
          p.status === 'presented' || p.status === 'closed'
            ? 'Impressive delivery, well-structured codebase and solid testing.'
            : null,
      });
    }
    nameIndex++;
  }

  const insertedTeams = await db.insert(team).values(teamsData).returning();

  console.log('Enrolling students and structuring groups…');
  const enrollmentsToInsert: (typeof projectEnrollment.$inferInsert)[] = [];

  // Assign Student Test 1 to 'AI-Powered Patient Triage Portal' (ongoing)
  const isen3Project = insertedProjects.find((p) => p.name === 'AI-Powered Patient Triage Portal');
  const isen3Team = isen3Project
    ? insertedTeams.find((t) => t.projectId === isen3Project.id)
    : null;

  if (isen3Project && isen3Team) {
    enrollmentsToInsert.push({
      userId: studentTestId,
      projectId: isen3Project.id,
      teamId: isen3Team.id,
      responsabilityId: 1,
    });
  }

  // Assign Student Test 2 to 'Greenhouse Hydroponic Automator' (ongoing)
  const isen4Project = insertedProjects.find((p) => p.name === 'Greenhouse Hydroponic Automator');
  const isen4Team = isen4Project
    ? insertedTeams.find((t) => t.projectId === isen4Project.id)
    : null;

  if (isen4Project && isen4Team) {
    enrollmentsToInsert.push({
      userId: student2TestId,
      projectId: isen4Project.id,
      teamId: isen4Team.id,
      responsabilityId: 1,
    });
  }

  // Assign random students to teams (each student in only one team)
  let studentIndex = 0;
  for (const t of insertedTeams) {
    const teamSize = getInt({ min: 3, max: 4 });
    const currentTeamMembers = enrollmentsToInsert.filter((e) => e.teamId === t.id);
    let membersToAdd = teamSize - currentTeamMembers.length;
    let isFirstMember = currentTeamMembers.length === 0;

    for (let m = 0; m < membersToAdd; m++) {
      if (studentIndex < randomStudentIds.length) {
        const studentId = randomStudentIds[studentIndex++];
        const isLeader = isFirstMember;
        if (isFirstMember) {
          isFirstMember = false;
        }
        enrollmentsToInsert.push({
          userId: studentId,
          projectId: t.projectId,
          teamId: t.id,
          responsabilityId: isLeader ? 1 : null,
        });
      }
    }
  }

  // Add remaining students to idle projects (without teams)
  const idleProjects = insertedProjects.filter(
    (p) => p.status === 'proposed' || p.status === 'validated',
  );
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

  await db.insert(projectEnrollment).values(enrollmentsToInsert);

  return {
    insertedTeams,
    enrollmentsToInsert,
  };
}
