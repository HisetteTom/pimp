import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
    plugins: [
        usernameClient(),
    ],
    fetchOptions: {
        onError(context) {
            console.error(context.error);
        },
    },
});
