import { db } from "../src/db";
import { user, account, session, verification } from "../src/db/schema/auth";
import { project } from "../src/db/schema/project";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import "dotenv/config";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  console.log("Cleaning database...");
  await Promise.all([
    db.delete(account),
    db.delete(session),
    db.delete(verification),
    db.delete(user),
    db.delete(project)
  ]);
  console.log("Database cleaned.");

  const [passwordHash, profPasswordHash] = await Promise.all([
    bcrypt.hash("etudiant", 10),
    bcrypt.hash("professeur", 10)
  ]);

  const studentId = crypto.randomUUID();
  await db.insert(user).values({
    id: studentId,
    name: "Étudiant Test",
    email: "etudiant@test.com",
    username: "etudiant",
    role: "student",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(account).values({
    id: crypto.randomUUID(),
    userId: studentId,
    accountId: studentId,
    providerId: "credential",
    password: passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const profId = crypto.randomUUID();
  await db.insert(user).values({
    id: profId,
    name: "Professeur Test",
    email: "prof@test.com",
    username: "professeur",
    role: "professor",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(account).values({
    id: crypto.randomUUID(),
    userId: profId,
    accountId: profId,
    providerId: "credential",
    password: profPasswordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const projectsData = [];
  for (let i = 0; i < 5; i++) {
    projectsData.push({
      name: faker.company.catchPhrase(),
      description: faker.lorem.paragraphs(2),
      status: i < 2 ? "assigned" : "proposed",
      dateStart: faker.date.soon().toISOString().split('T')[0],
      dateEnd: faker.date.future().toISOString().split('T')[0],
    });
  }

  const insertedProjects = await db.insert(project).values(projectsData).returning();

  await db.update(user)
    .set({ projectId: insertedProjects[0].id })
    .where(eq(user.id, studentId));

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
