import { pgTable, integer, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const notification = pgTable('notification', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'project_proposed' | 'task_assigned' | 'comment_added'
  link: text('link'), // URL to navigate when clicked
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
