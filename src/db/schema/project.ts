import { pgTable, integer, date, text } from 'drizzle-orm/pg-core';

export const project = pgTable('project', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('proposed'), // proposed, validated, ongoing, late, delivered, presented, closed
  dateStart: date('date-start'),
  dateEnd: date('date-end'),
  maxGroups: integer('max_groups').notNull().default(8),
  maxMembersPerGroup: integer('max_members_per_group').notNull().default(5),
});
