import { test, expect } from '@fixtures';

/** Specification: docs/test-cases/gad/home-test-cases.md (TC4). */
test.describe('Home', () => {
  test(
    'TC4: shows the user menu button to a signed-in user',
    { tag: ['@smoke', '@read-only'] },
    async ({ homePage }) => {
      // The button is icon-only: one visible element with role button is the exact observable result.
      await test.step('Verify exactly one user menu button is visible', async () => {
        await expect(homePage.userMenuButton).toHaveCount(1);
        await expect(homePage.userMenuButton).toBeVisible();
        await expect(homePage.userMenuButton).toHaveRole('button');
      });
    },
  );
});
