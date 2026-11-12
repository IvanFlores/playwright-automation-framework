import { test, expect } from '@fixtures';
import { users } from '@data/auth.data';

test.describe('Login', () => {
  test('greets the user by email after a valid login @smoke', async ({ loginPage }) => {
    await loginPage.login(users.appUser.username, users.appUser.password);

    await expect(loginPage.greeting).toBeVisible();
    await expect(loginPage.greeting).toContainText(users.appUser.username);
    await expect(loginPage.userMenuButton).toMatchAriaSnapshot(`- button`);
  });
});
