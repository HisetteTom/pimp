import { pgTable, integer, text, AnyPgColumn } from "drizzle-orm/pg-core";
import { project } from "./project";

export const team = pgTable("team", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	name: text("name").notNull(),
	projectId: integer("project_id").references((): AnyPgColumn => project.id).notNull(),
	grade: text("grade"),
	feedback: text("feedback"),
	notes: text("notes"),
});
