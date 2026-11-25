import { test, expect } from '@fixtures';
import { authPaths, greetingFor, users } from '@data/auth.data';

/** Specification: docs/test-cases/gad/login-test-cases.md (TC1). */
test.describe('Login', () => {
  test(
    'TC1: greets the user by email after a valid login',
    { tag: ['@smoke', '@read-only'] },
    async ({ loginPage }) => {
      await test.step('Verify the login form is empty and ready', async () => {
        await expect(loginPage.emailInput).toBeEmpty();
        await expect(loginPage.passwordInput).toBeEmpty();
        await expect(loginPage.submitButton).toBeVisible();
      });

      await test.step('Log in and verify the landing page greets the user by email', async () => {
        await loginPage.login(users.appUser.username, users.appUser.password);
        await expect(loginPage.greeting).toHaveText(greetingFor(users.appUser.username));
        expect(loginPage.currentPath()).toBe(authPaths.welcome);
      });

      await test.step('Verify the user menu button is rendered', async () => {
        await expect(loginPage.userMenuButton).toHaveRole('button');
      });
    },
  );
});
