import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { project } from './project';
import { team } from './team';

/**
 * Milestone checkins established by professors for a project timeline.
 */
export const checkpoint = pgTable('checkpoint', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  projectId: integer('project_id')
    .references(() => project.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  dueDate: timestamp('due_date').notNull(),
});

/**
 * Feedback/progress notes written by supervisors or teams regarding a milestone checkpoint.
 */
export const checkpointNote = pgTable('checkpoint_note', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  checkpointId: integer('checkpoint_id')
    .references(() => checkpoint.id, { onDelete: 'cascade' })
    .notNull(),
  teamId: integer('team_id')
    .references(() => team.id, { onDelete: 'cascade' })
    .notNull(),
  notes: text('notes').notNull().default(''),
});
