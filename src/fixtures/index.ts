import { test as base, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { HomePage } from '@pages/HomePage';
import { ApiClient } from '@api/ApiClient';
import { users } from '@data/auth.data';

type Fixtures = {
  authenticatedPage: LoginPage;
  loginPage: LoginPage;
  homePage: HomePage;
  api: ApiClient;
};

/** Import `test` and `expect` from here (`@fixtures`), not from @playwright/test, in every spec. */
export const test = base.extend<Fixtures>({
  // Logs in with the default test account; Playwright discards the context after each test.
  authenticatedPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await lp.navigate('/login/');
    await lp.login(users.appUser.username, users.appUser.password);
    await use(lp);
  },

  // No auth: login form ready to fill.
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login/');
    await use(loginPage);
  },

  // Auth required — post-login landing page, so no extra navigate().
  homePage: async ({ page, authenticatedPage }, use) => {
    void authenticatedPage; // dependency only: guarantees login ran on this `page`
    await use(new HomePage(page));
  },

  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});

export { expect };
