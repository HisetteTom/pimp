import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

/**
 * Route handler routing all authentication API calls through the Better Auth client/server.
 */
export const { GET, POST } = toNextJsHandler(auth);
