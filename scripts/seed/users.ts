import { db } from './db';
import { user, account } from '../../src/db/schema/auth';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

export async function seedUsers() {
  console.log('Hashing passwords…');
  const [studentPasswordHash, profPasswordHash] = await Promise.all([
    bcrypt.hash('etudiant', 10),
    bcrypt.hash('professeur', 10),
  ]);

  const studentTestId = crypto.randomUUID();
  const profTestId = crypto.randomUUID();

  console.log('Creating core test users…');
  await db.insert(user).values([
    {
      id: studentTestId,
      name: 'Student Test',
      email: 'etudiant@test.com',
      username: 'etudiant',
      role: 'student',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: profTestId,
      name: 'Professor Test',
      email: 'prof@test.com',
      username: 'professeur',
      role: 'professor',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await db.insert(account).values([
    {
      id: crypto.randomUUID(),
      userId: studentTestId,
      accountId: studentTestId,
      providerId: 'credential',
      password: studentPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      userId: profTestId,
      accountId: profTestId,
      providerId: 'credential',
      password: profPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('Generating 80 random student accounts…');
  const randomStudentIds: string[] = [];
  const studentsToInsert = [];
  const accountsToInsert = [];

  for (let i = 0; i < 80; i++) {
    const sId = crypto.randomUUID();
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase();
    const username = faker.internet.username({ firstName: name.split(' ')[0] }).toLowerCase();

    studentsToInsert.push({
      id: sId,
      name,
      email,
      username,
      role: 'student',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    accountsToInsert.push({
      id: crypto.randomUUID(),
      userId: sId,
      accountId: sId,
      providerId: 'credential',
      password: studentPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    randomStudentIds.push(sId);
  }

  console.log('Generating 3 random professor accounts…');
  const profIds = [profTestId];
  for (let i = 0; i < 3; i++) {
    const pId = crypto.randomUUID();
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase();
    const username = faker.internet.username({ firstName: name.split(' ')[0] }).toLowerCase();

    studentsToInsert.push({
      id: pId,
      name,
      email,
      username,
      role: 'professor',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    accountsToInsert.push({
      id: crypto.randomUUID(),
      userId: pId,
      accountId: pId,
      providerId: 'credential',
      password: profPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    profIds.push(pId);
  }

  await db.insert(user).values(studentsToInsert);
  await db.insert(account).values(accountsToInsert);

  return {
    studentTestId,
    profTestId,
    randomStudentIds,
    profIds,
    studentPasswordHash,
    profPasswordHash,
  };
}
