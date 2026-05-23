import { client } from './seed/db';
import { cleanDatabase } from './seed/clean';
import { seedUsers } from './seed/users';
import { seedProjects } from './seed/projects';
import { seedTeams } from './seed/teams';
import { seedTasks } from './seed/tasks';

async function main() {
  console.log('Seeding database...');

  // 1. Clean all existing tables
  // eslint-disable-next-line react-doctor/async-parallel
  await cleanDatabase();

  // 2. Seed Users & Projects in parallel
  const [{ studentTestId, randomStudentIds }, insertedProjects] = await Promise.all([
    seedUsers(),
    seedProjects(),
  ]);

  // 4. Seed Teams & Enrollments
  const { insertedTeams, enrollmentsToInsert } = await seedTeams({
    insertedProjects,
    studentTestId,
    randomStudentIds,
  });

  // 5. Seed Tasks & Deliverables (Notifications completely skipped!)
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
