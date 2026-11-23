import { defineConfig, devices } from '@playwright/test';
// The only environment entry point: loads .env.<TEST_ENV> then .env and validates required
// variables at import time (fails fast with descriptive errors).
import { Env } from './src/config/Env';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Env.isCI,
  retries: Env.isCI ? 2 : 0,
  // spec-data: serial — CI runs against one GAD service container on a 2-vCPU runner; data isolation
  // between workers is proven locally with `--workers=4 --repeat-each=4` (docs/evidence/M7).
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
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            // Headed Firefox on Windows stops painting windows covered by other windows,
            // which makes clicks hang. Keep rendering them as if visible.
            'widget.windows.window_occlusion_tracking.enabled': false,
          },
        },
      },
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
