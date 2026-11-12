import { test, expect } from '@fixtures';
import { users, loginMessages } from '@data/auth.data';

test.describe('Login', () => {
  test(
    'TC2: shows an error and stays signed out with invalid credentials',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await test.step('Submit the login form with an unknown account', async () => {
        await loginPage.login(users.invalidUser.username, users.invalidUser.password);
      });

      await test.step('Verify the invalid credentials error is shown', async () => {
        await expect(loginPage.errorMessage).toHaveText(loginMessages.invalidCredentials);
      });

      await test.step('Verify the user is not signed in', async () => {
        await expect(loginPage.submitButton).toBeVisible();
        await expect(loginPage.greeting).toBeHidden();
      });
    },
  );
});
