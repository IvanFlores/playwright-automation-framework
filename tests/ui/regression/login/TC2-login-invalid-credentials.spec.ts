import { test, expect } from '@fixtures';
import { authPaths, loginMessages, users } from '@data/auth.data';

/** Specification: docs/test-cases/gad/login-test-cases.md (TC2). */
test.describe('Login', () => {
  test(
    'TC2: shows an error and stays signed out with invalid credentials',
    { tag: ['@regression', '@read-only'] },
    async ({ loginPage }) => {
      await test.step('Submit an unknown account and verify the error text', async () => {
        await loginPage.login(users.invalidUser.username, users.invalidUser.password);
        await expect(loginPage.errorMessage).toHaveText(loginMessages.invalidCredentials);
      });

      await test.step('Verify the user stays on the login page, signed out', async () => {
        expect(loginPage.currentPath()).toBe(authPaths.login);
        await expect(loginPage.submitButton).toBeVisible();
        await expect(loginPage.greeting).toHaveCount(0);
      });
    },
  );
});
