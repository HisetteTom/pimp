import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as projectSchema from "./schema/project";
import * as taskSchema from "./schema/task";
import * as commentSchema from "./schema/comment";
import * as compteSchema from "./schema/compte";
import * as responsabilitySchema from "./schema/responsability";
import * as livrableSchema from "./schema/livrable";
import * as authSchema from "./schema/auth";

const schema = {
  ...projectSchema,
  ...taskSchema,
  ...commentSchema,
  ...compteSchema,
  ...responsabilitySchema,
  ...livrableSchema,
  ...authSchema,
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment variables");
}

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
