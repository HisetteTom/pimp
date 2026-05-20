import { pgTable, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { responsability } from "./responsability";
import { team } from "./team";

export const task = pgTable("task", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	name: text("name").notNull(),
	description: text("description"),
	status: varchar("status", { length: 255 }).notNull().default("todo"), // todo, in_progress, done
	deadline: timestamp("deadline"),
	teamId: integer("team_id").references(() => team.id).notNull(),
	responsabilityId: integer("responsability_id").references(() => responsability.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
