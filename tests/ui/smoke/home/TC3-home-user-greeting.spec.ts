import { test, expect } from '@fixtures';
import { greetingFor, users } from '@data/auth.data';

/** Specification: docs/test-cases/gad/home-test-cases.md (TC3). */
test.describe('Home', () => {
  test(
    'TC3: shows the signed-in user greeting',
    { tag: ['@smoke', '@read-only'] },
    async ({ homePage }) => {
      await test.step('Verify the greeting shows the user email', async () => {
        await expect(homePage.greeting).toHaveText(greetingFor(users.appUser.username));
      });
    },
  );
});
