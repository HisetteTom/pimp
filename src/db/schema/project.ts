import { pgTable, integer, date, foreignKey } from "drizzle-orm/pg-core";
import { task } from "./task";

export const project = pgTable("project", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	dateStart: date("date-start"),
	dateEnd: date("date-end"),
});

export const projectTaskFk = foreignKey({
	columns: [project.id],
	foreignColumns: [task.id],
});
