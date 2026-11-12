import dotenv from 'dotenv';
import path from 'path';

const testEnv = process.env.TEST_ENV ?? 'local';

// Environment-specific file wins over the base .env (dotenv never overwrites an already-set variable).
dotenv.config({ path: path.resolve(process.cwd(), `.env.${testEnv}`), quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

/** Variables that must be present for the suite to run, with a hint shown when missing. */
const REQUIRED = {
  BASE_URL: 'URL of the web application under test, e.g. http://localhost:3001',
  TEST_USERNAME: 'login (email) of the test account used by the authenticatedPage fixture',
  TEST_PASSWORD: 'password of that test account',
} as const;

type RequiredName = keyof typeof REQUIRED;

const missing = (Object.keys(REQUIRED) as RequiredName[]).filter(
  (name) => !process.env[name]?.trim(),
);

if (missing.length > 0) {
  const details = missing.map((name) => `  - ${name}: ${REQUIRED[name]}`).join('\n');
  throw new Error(
    `Missing required environment variable(s) for TEST_ENV="${testEnv}":\n${details}\n` +
      `Create a .env file from .env.example (or set them in the shell / CI secrets) and try again.`,
  );
}

const read = (name: RequiredName): string => process.env[name]!.trim();

const baseUrl = read('BASE_URL');
try {
  new URL(baseUrl);
} catch {
  throw new Error(
    `BASE_URL must be an absolute URL (e.g. http://localhost:3001), got "${baseUrl}".`,
  );
}

/** Validated, typed access to environment configuration. Import as `import { Env } from '@config/Env'`. */
export const Env = {
  testEnv,
  baseUrl,
  apiBaseUrl: process.env.API_BASE_URL?.trim() || 'https://jsonplaceholder.typicode.com',
  testUsername: read('TEST_USERNAME'),
  testPassword: read('TEST_PASSWORD'),
  isCI: !!process.env.CI,
} as const;
