import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { team } from './team';

export const chatMessage = pgTable('chat_message', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  teamId: integer('team_id')
    .references(() => team.id, { onDelete: 'cascade' })
    .notNull(),
  senderId: text('sender_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
