import { db } from './index';
import { responsability } from './schema/responsability';

/**
 * Seeds static lookup tables in the database.
 * Resolves conflicts by ignoring pre-existing lookup records.
 */
async function seed() {
  console.log('Seeding lookup tables...');
  await db.insert(responsability).values({ id: 1 }).onConflictDoNothing();
  console.log('Lookup tables seeded successfully.');
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database lookup seeding failed:', err);
    process.exit(1);
  });
