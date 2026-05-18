import { pgTable, integer, varchar, foreignKey } from "drizzle-orm/pg-core";
import { project } from "./project";
import { task } from "./task";

export const comment = pgTable("comment", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	text: varchar("text", { length: 255 }),
});

export const commentProjectFk = foreignKey({
	columns: [comment.id],
	foreignColumns: [project.id],
});

export const commentTaskFk = foreignKey({
	columns: [comment.id],
	foreignColumns: [task.id],
});
