import { pgTable, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { team } from "./team";

export const livrable = pgTable("livrable", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	name: text("name").notNull(),
	source: varchar("source", { length: 255 }),
	teamId: integer("team_id").references(() => team.id).notNull(),
	status: text("status").notNull().default("pending"), // pending, approved, rejected
	feedback: text("feedback"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
