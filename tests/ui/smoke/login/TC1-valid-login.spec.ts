import { test, expect } from '@fixtures';
import { users } from '@data/auth.data';

test.describe('Login', () => {
  test(
    'TC1: greets the user by email after a valid login',
    { tag: '@smoke' },
    async ({ loginPage }) => {
      await test.step('Log in with the app user', async () => {
        await loginPage.login(users.appUser.username, users.appUser.password);
      });

      await test.step('Verify the greeting shows the user email', async () => {
        await expect(loginPage.greeting).toBeVisible();
        await expect(loginPage.greeting).toContainText(users.appUser.username);
      });

      await test.step('Verify the user menu button is rendered', async () => {
        await expect(loginPage.userMenuButton).toMatchAriaSnapshot(`- button`);
      });
    },
  );
});
