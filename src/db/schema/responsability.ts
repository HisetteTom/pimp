import { pgTable, integer } from "drizzle-orm/pg-core";

export const responsability = pgTable("responsability", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
});
