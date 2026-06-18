import { pgTable, integer, text, primaryKey } from 'drizzle-orm/pg-core';
import { project } from './project';
import { user } from './auth';

/**
 * Tracks which projects were explicitly declined or refused by students.
 */
export const refusedProject = pgTable(
  'refused_project',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    projectId: integer('project_id')
      .notNull()
      .references(() => project.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.projectId] }),
    };
  },
);
