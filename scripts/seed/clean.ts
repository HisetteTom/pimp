import { db } from "./db";
import { user, account, session, verification } from "../../src/db/schema/auth";
import { project } from "../../src/db/schema/project";
import { team } from "../../src/db/schema/team";
import { task } from "../../src/db/schema/task";
import { livrable } from "../../src/db/schema/livrable";
import { comment } from "../../src/db/schema/comment";
import { refusedProject } from "../../src/db/schema/refused_project";
import { projectEnrollment } from "../../src/db/schema/project_enrollment";
import { compte } from "../../src/db/schema/compte";
import { responsability } from "../../src/db/schema/responsability";
import { notification } from "../../src/db/schema/notification";

export async function cleanDatabase() {
  console.log("Cleaning database...");
  await Promise.all([
    db.delete(comment),
    db.delete(task),
    db.delete(livrable),
    db.delete(projectEnrollment),
    db.delete(refusedProject),
    db.delete(compte),
    db.delete(session),
    db.delete(notification),
  ])
    .then(() => Promise.all([
      db.delete(account),
      db.delete(verification),
      db.delete(team),
    ]))
    .then(() => Promise.all([
      db.delete(user),
      db.delete(project),
    ]))
    .then(() => Promise.all([
      db.delete(responsability),
    ]));
  
  await db.insert(responsability).values({ id: 1 });
  console.log("Database cleaned.");
}
