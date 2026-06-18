import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as projectSchema from './schema/project';
import * as teamSchema from './schema/team';
import * as taskSchema from './schema/task';
import * as commentSchema from './schema/comment';
import * as compteSchema from './schema/compte';
import * as responsabilitySchema from './schema/responsability';
import * as livrableSchema from './schema/livrable';
import * as authSchema from './schema/auth';
import * as refusedProjectSchema from './schema/refused_project';
import * as checkpointSchema from './schema/checkpoint';
import * as evaluationSchema from './schema/evaluation';
import * as notificationSchema from './schema/notification';
import * as projectEnrollmentSchema from './schema/project_enrollment';

/**
 * Unified application database schema.
 */
const schema = {
  ...projectSchema,
  ...teamSchema,
  ...taskSchema,
  ...commentSchema,
  ...compteSchema,
  ...responsabilitySchema,
  ...livrableSchema,
  ...authSchema,
  ...refusedProjectSchema,
  ...checkpointSchema,
  ...evaluationSchema,
  ...notificationSchema,
  ...projectEnrollmentSchema,
};

declare global {
  // Prevent duplicate database client connections during local hot-reloads
  var dbClient: postgres.Sql | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables');
}

let client: postgres.Sql;
if (process.env.NODE_ENV === 'production') {
  client = postgres(connectionString, { prepare: false });
} else {
  if (!globalThis.dbClient) {
    globalThis.dbClient = postgres(connectionString, { prepare: false, max: 1 });
  }
  client = globalThis.dbClient;
}

/**
 * Configured Drizzle client instance.
 */
export const db = drizzle(client, { schema });
