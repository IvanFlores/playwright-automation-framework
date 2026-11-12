import { Env } from '@config/Env';

export type User = { username: string; password: string };

/** Test accounts. Real credentials come from the environment, never from source code. */
export const users = {
  appUser: {
    username: Env.testUsername,
    password: Env.testPassword,
  },
} as const satisfies Record<string, User>;
