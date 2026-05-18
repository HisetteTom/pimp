import { pgTable, integer, varchar, time, foreignKey } from "drizzle-orm/pg-core";
import { responsability } from "./responsability";

export const task = pgTable("task", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	status: varchar("status", { length: 255 }),
	timeStart: time("time-start", { withTimezone: true }),
	timeEnd: time("time-end", { withTimezone: true }),
	responsabilityId: integer("responsability_id").references(() => responsability.id),
});
