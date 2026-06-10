import { pgTable, integer, varchar, text, timestamp, AnyPgColumn } from 'drizzle-orm/pg-core';
import { team } from './team';
import { user } from './auth';

export const task = pgTable('task', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: text('name').notNull(),
  description: text('description'),
  status: varchar('status', { length: 255 }).notNull().default('todo'), // todo, in_progress, done
  priority: varchar('priority', { length: 255 }).notNull().default('medium'), // low, medium, high
  deadline: timestamp('deadline'),
  teamId: integer('team_id')
    .references((): AnyPgColumn => team.id)
    .notNull(),
  assigneeId: text('assignee_id').references(() => user.id),
  assignees: text('assignees'), // Comma-separated user IDs
  responsabilityId: integer('responsability_id'),
  inProgressAt: timestamp('in_progress_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
