import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
// Validates required variables at import time (fails fast with descriptive errors).
import { Env } from './src/config/Env';

// Load .env.<TEST_ENV> first (it wins), then the base .env.
// Env.ts already does this on import; kept here so the config is self-explanatory.
dotenv.config({ path: path.resolve(__dirname, `.env.${process.env.TEST_ENV ?? 'local'}`), quiet: true });
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Env.isCI,
  retries: Env.isCI ? 2 : 0,
  workers: Env.isCI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: Env.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // UI projects: everything under tests/ except API tests and setup files.
    {
      name: 'chromium',
      testIgnore: ['api/**'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: ['api/**'],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: ['api/**'],
      use: { ...devices['Desktop Safari'] },
    },

    // API project: different host, so it gets its own baseURL.
    {
      name: 'api',
      testMatch: 'api/**/*.spec.ts',
      use: { baseURL: Env.apiBaseUrl },
    },
  ],
});
