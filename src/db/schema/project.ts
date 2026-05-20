import { pgTable, integer, date, foreignKey, text, AnyPgColumn } from "drizzle-orm/pg-core";
import { task } from "./task";

export const project = pgTable("project", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	name: text("name").notNull(),
	description: text("description"),
	status: text("status").notNull().default("proposed"), // proposed, assigned, ongoing, finished
	dateStart: date("date-start"),
	dateEnd: date("date-end"),
	taskId: integer("task_id").references((): AnyPgColumn => task.id),
	maxGroups: integer("max_groups").notNull().default(8),
	maxMembersPerGroup: integer("max_members_per_group").notNull().default(5),
});
