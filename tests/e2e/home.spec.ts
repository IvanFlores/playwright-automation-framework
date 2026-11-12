import { test, expect } from '@fixtures';
import { users } from '@data/auth.data';

test.describe('Home page (authenticated)', () => {
  test('shows the signed-in user greeting @smoke', async ({ homePage }) => {
    await expect(homePage.greeting).toContainText(users.appUser.username);
  });

  test('shows the user menu button @regression', async ({ homePage }) => {
    await expect(homePage.userMenuButton).toBeVisible();
  });
});
