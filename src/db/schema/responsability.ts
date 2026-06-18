import { pgTable, integer } from 'drizzle-orm/pg-core';

/**
 * Roles/responsibilities assigned to users within a team context.
 */
export const responsability = pgTable('responsability', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
});
