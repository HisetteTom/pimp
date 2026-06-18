import { pgTable, integer, varchar, index } from 'drizzle-orm/pg-core';
import { project } from './project';

/**
 * Legacy account schema. Maps accounts to specific projects.
 */
export const compte = pgTable(
  'compte',
  {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 255 }),
    mail: varchar('mail', { length: 255 }),
    password: varchar('password', { length: 255 }),
    role: varchar('role', { length: 255 }),
    projectId: integer('project_id').references(() => project.id),
    responsabilityId: integer('responsability_id'),
  },
  (table) => {
    return {
      compteIndex0: index('compte_index_0').on(table.id),
    };
  },
);
