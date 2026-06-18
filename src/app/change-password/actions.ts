'use server';

import { db } from '@/db';
import { user, account } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * Updates the password during first login, resetting the password-change requirement flag.
 */
export async function updateFirstLoginPassword(password: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const passwordHash = await bcrypt.hash(password, 10);

  await db.transaction(async (tx) => {
    // Update password in credentials account
    await tx.update(account).set({ password: passwordHash }).where(eq(account.userId, userId));

    // Clear requiresPasswordChange flag on user profile
    await tx.update(user).set({ requiresPasswordChange: false }).where(eq(user.id, userId));
  });
}
