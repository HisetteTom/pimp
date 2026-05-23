import { pgTable, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { project } from './project';
import { team } from './team';
import { responsability } from './responsability';

export const projectEnrollment = pgTable(
  'project_enrollment',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    projectId: integer('project_id')
      .notNull()
      .references(() => project.id),
    teamId: integer('team_id').references(() => team.id),
    responsabilityId: integer('responsability_id').references(() => responsability.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.projectId] }),
  }),
);
