import { pgTable, integer, varchar, index, foreignKey } from "drizzle-orm/pg-core";
import { project } from "./project";
import { responsability } from "./responsability";

export const compte = pgTable("compte", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	name: varchar("name", { length: 255 }),
	mail: varchar("mail", { length: 255 }),
	password: varchar("password", { length: 255 }),
	role: varchar("role", { length: 255 }),
}, (table) => {
	return {
		compteIndex0: index("compte_index_0").on(table.id),
	};
});

export const compteProjectFk = foreignKey({
	columns: [compte.id],
	foreignColumns: [project.id],
});

export const compteResponsabilityFk = foreignKey({
	columns: [compte.id],
	foreignColumns: [responsability.id],
});
