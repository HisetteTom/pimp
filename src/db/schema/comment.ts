import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';
import { project } from './project';
import { task } from './task';

/**
 * Text remarks attached to specific tasks or parent project contexts.
 */
export const comment = pgTable('comment', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  text: varchar('text', { length: 255 }),
  projectId: integer('project_id').references(() => project.id),
  taskId: integer('task_id').references(() => task.id),
});
