import { pgTable, integer, varchar, foreignKey } from "drizzle-orm/pg-core";
import { project } from "./project";

export const livrable = pgTable("livrable", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	source: varchar("source", { length: 255 }),
	projectId: integer("project_id").references(() => project.id),
});
