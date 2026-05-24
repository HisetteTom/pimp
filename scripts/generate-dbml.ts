import * as path from 'path';
import * as project from '../src/db/schema/project';
import * as team from '../src/db/schema/team';
import * as task from '../src/db/schema/task';
import * as comment from '../src/db/schema/comment';
import * as compte from '../src/db/schema/compte';
import * as responsability from '../src/db/schema/responsability';
import * as livrable from '../src/db/schema/livrable';
import * as auth from '../src/db/schema/auth';
import * as refused_project from '../src/db/schema/refused_project';
import * as project_enrollment from '../src/db/schema/project_enrollment';
import * as checkpoint from '../src/db/schema/checkpoint';
import * as evaluation from '../src/db/schema/evaluation';
import * as notification from '../src/db/schema/notification';
import { pgGenerate } from 'drizzle-dbml-generator';

const schema = {
  ...project,
  ...team,
  ...task,
  ...comment,
  ...compte,
  ...responsability,
  ...livrable,
  ...auth,
  ...refused_project,
  ...project_enrollment,
  ...checkpoint,
  ...evaluation,
  ...notification,
};

const out = path.resolve(__dirname, '../src/db/schema.dbml');
const relational = false;

pgGenerate({ schema, out, relational });
console.log('DBML generated successfully at:', out);
