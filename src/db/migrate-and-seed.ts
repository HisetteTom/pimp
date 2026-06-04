import { db } from './index';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { responsability } from './schema/responsability';
import path from 'path';

async function init() {
  console.log('Running database migrations...');
  const migrationsFolder = path.join(process.cwd(), 'drizzle');

  await migrate(db, { migrationsFolder });
  console.log('Migrations applied successfully.');

  console.log('Seeding lookup tables...');
  await db.insert(responsability).values({ id: 1 }).onConflictDoNothing();
  console.log('Lookup tables seeded successfully.');
}

init()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database migration/seed failed:', err);
    process.exit(1);
  });
