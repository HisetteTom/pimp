import { pgTable, integer, date, foreignKey, text } from "drizzle-orm/pg-core";
import { task } from "./task";

export const project = pgTable("project", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	name: text("name").notNull(),
	description: text("description"),
	status: text("status").notNull().default("proposed"), // proposed, assigned, ongoing, finished
	dateStart: date("date-start"),
	dateEnd: date("date-end"),
	taskId: integer("task_id").references(() => task.id),
});
