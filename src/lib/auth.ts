import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import { user, session, account, verification } from '@/db/schema';
import { username } from 'better-auth/plugins';
import bcrypt from 'bcrypt';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },
  plugins: [username()],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: 'student',
            },
          };
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'student',
      },
      promo: {
        type: 'string',
        required: false,
      },
      projectId: {
        type: 'number',
        required: false,
      },
      responsabilityId: {
        type: 'number',
        required: false,
      },
      requiresPasswordChange: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
});

// Automatically create seed admin if env variables are present in production on startup
if (
  process.env.NODE_ENV === 'production' &&
  process.env.SEED_ADMIN_EMAIL &&
  process.env.SEED_ADMIN_PASSWORD
) {
  (async () => {
    try {
      const email = process.env.SEED_ADMIN_EMAIL;
      const existing = await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      });
      if (!existing) {
        console.log(`[Auto-Seed] Creating admin user: ${email}`);
        const userId = crypto.randomUUID();
        const hashedPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);

        await db.insert(user).values({
          id: userId,
          name: 'Owner Admin',
          email: email,
          username: 'owner',
          role: 'admin',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await db.insert(account).values({
          id: crypto.randomUUID(),
          userId: userId,
          accountId: userId,
          providerId: 'credential',
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`[Auto-Seed] Admin user ${email} created successfully.`);
      }
    } catch (e) {
      console.error('[Auto-Seed] Failed to auto-create admin user:', e);
    }
  })();
}
