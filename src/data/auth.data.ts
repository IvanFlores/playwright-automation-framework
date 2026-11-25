import { Env } from '@config/Env';

export type User = { username: string; password: string };

/** Test accounts. Real credentials come from the environment, never from source code. */
export const users = {
  appUser: {
    username: Env.testUsername,
    password: Env.testPassword,
  },
  /** Deliberately non-existent account for negative login tests (not a real credential). */
  invalidUser: {
    username: 'unknown.user@example.test',
    password: 'not-a-valid-password',
  },
} as const satisfies Record<string, User>;

/** Messages the login page shows. */
export const loginMessages = {
  invalidCredentials: 'Invalid username or password',
} as const;

/** Pages involved in signing in (GAD 2.9.0). */
export const authPaths = {
  login: '/login/',
  /** Landing page after a valid login. */
  welcome: '/welcome',
} as const;

/** Greeting GAD shows to a signed-in user. */
export const greetingFor = (email: string): string => `Hi ${email}!`;
