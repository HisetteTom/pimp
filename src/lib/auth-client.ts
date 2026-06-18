import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';

/**
 * Better Auth client configuration for browser-side authentication flows.
 */
export const authClient = createAuthClient({
  plugins: [usernameClient()],
  fetchOptions: {
    onError(context) {
      console.error(context.error);
    },
  },
});
