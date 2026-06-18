import { pgTable, integer, date, text, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Core project schema defining dates, restrictions, targets, and coordinator configurations.
 */
export const project = pgTable('project', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('proposed'), // proposed, validated, ongoing, late, delivered, presented, closed
  dateStart: date('date-start'),
  dateEnd: date('date-end'),
  maxGroups: integer('max_groups').notNull().default(8),
  maxMembersPerGroup: integer('max_members_per_group').notNull().default(5),
  teacherId: text('teacher_id'),
  targetPromos: text('target_promos')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  targetUsers: text('target_users')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  coTeachers: text('co_teachers')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  showEvaluationGrid: boolean('show_evaluation_grid').notNull().default(false),
  juries: text('juries')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
});
