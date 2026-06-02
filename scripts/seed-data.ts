import { client } from './seed/db';
import { cleanDatabase } from './seed/clean';
import { seedUsers } from './seed/users';
import { seedProjects } from './seed/projects';
import { seedTeams } from './seed/teams';
import { seedTasks } from './seed/tasks';

async function main() {
  console.log('Seeding database...');

  // 1. Clean all existing tables
  await cleanDatabase();

  // 2. Seed Users first sequentially
  const { studentTestId, student2TestId, profTestId, prof2TestId, randomStudentIds } =
    await seedUsers();

  // 3. Seed Projects with teacher IDs assigned
  const insertedProjects = await seedProjects(profTestId, prof2TestId);

  // 4. Seed Teams & Enrollments
  const { insertedTeams, enrollmentsToInsert } = await seedTeams({
    insertedProjects,
    studentTestId,
    student2TestId,
    randomStudentIds,
  });

  // 5. Seed Tasks & Deliverables
  await seedTasks({
    insertedTeams,
    enrollmentsToInsert,
  });

  console.log('Seeding completed successfully!');
  await client.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Seeding failed:', err);
  await client.end();
  process.exit(1);
});
