import { pgTable, integer, text } from "drizzle-orm/pg-core";
import { project } from "./project";

export const team = pgTable("team", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	name: text("name").notNull(),
	projectId: integer("project_id").references(() => project.id).notNull(),
});
