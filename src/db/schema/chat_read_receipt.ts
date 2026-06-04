import { pgTable, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { team } from './team';

export const chatReadReceipt = pgTable(
  'chat_read_receipt',
  {
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    teamId: integer('team_id')
      .references(() => team.id, { onDelete: 'cascade' })
      .notNull(),
    lastReadAt: timestamp('last_read_at').notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.teamId] }),
  }),
);
