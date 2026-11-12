import { test, expect } from '@fixtures';

test.describe('Home', () => {
  test(
    'TC4: shows the user menu button to a signed-in user',
    { tag: '@smoke' },
    async ({ homePage }) => {
      await test.step('Verify the user menu button is visible', async () => {
        await expect(homePage.userMenuButton).toBeVisible();
      });
    },
  );
});
