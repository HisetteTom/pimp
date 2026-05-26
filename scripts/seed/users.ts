import { db } from './db';
import { user, account } from '../../src/db/schema/auth';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

export async function seedUsers() {
  console.log('Hashing passwords…');
  const [studentPasswordHash, profPasswordHash, adminPasswordHash] = await Promise.all([
    bcrypt.hash('etudiant', 10),
    bcrypt.hash('professeur', 10),
    bcrypt.hash('administrateur', 10),
  ]);

  const studentTestId = crypto.randomUUID();
  const student2TestId = crypto.randomUUID();
  const profTestId = crypto.randomUUID();
  const prof2TestId = crypto.randomUUID();
  const adminTestId = crypto.randomUUID();

  console.log('Creating core test users…');
  await db.insert(user).values([
    {
      id: studentTestId,
      name: 'Student Test 1',
      email: 'etudiant@test.com',
      username: 'etudiant',
      role: 'student',
      promo: 'ISEN3',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: student2TestId,
      name: 'Student Test 2',
      email: 'student2@test.com',
      username: 'student2',
      role: 'student',
      promo: 'ISEN4',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: profTestId,
      name: 'Professor Test 1',
      email: 'prof@test.com',
      role: 'professor',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: prof2TestId,
      name: 'Professor Test 2',
      email: 'prof2@test.com',
      role: 'professor',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: adminTestId,
      name: 'Admin Test',
      email: 'admin@test.com',
      username: 'admin',
      role: 'admin',
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
      userId: student2TestId,
      accountId: student2TestId,
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
    {
      id: crypto.randomUUID(),
      userId: prof2TestId,
      accountId: prof2TestId,
      providerId: 'credential',
      password: profPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      userId: adminTestId,
      accountId: adminTestId,
      providerId: 'credential',
      password: adminPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('Generating 80 random student accounts…');
  const randomStudentIds: string[] = [];
  const studentsToInsert = [];
  const accountsToInsert = [];
  const promosList = ['ISEN1', 'ISEN2', 'ISEN3', 'ISEN4', 'ISEN5'];

  for (let i = 0; i < 80; i++) {
    const sId = crypto.randomUUID();
    const name = faker.person.fullName();
    const rawEmail = faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase();
    const email = `${rawEmail.split('@')[0]}_${i}@test.com`;
    const username = `${faker.internet.username({ firstName: name.split(' ')[0] }).toLowerCase()}_${i}`;

    studentsToInsert.push({
      id: sId,
      name,
      email,
      username,
      role: 'student',
      promo: promosList[Math.floor(Math.random() * promosList.length)],
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
  const profIds = [profTestId, prof2TestId];
  for (let i = 0; i < 3; i++) {
    const pId = crypto.randomUUID();
    const name = faker.person.fullName();
    const rawEmail = faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase();
    const email = `${rawEmail.split('@')[0]}_prof_${i}@test.com`;

    studentsToInsert.push({
      id: pId,
      name,
      email,
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
