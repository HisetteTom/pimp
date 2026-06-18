import { pgTable, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { team } from './team';

/**
 * Tracks the last read message timestamp per user in a team's chat.
 * Maintains separate markers for standard channels and private (supervisor) channels.
 */
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
    lastReadPrivateAt: timestamp('last_read_private_at').notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.teamId] }),
  }),
);
