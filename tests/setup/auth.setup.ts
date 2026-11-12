import { test as setup } from '@playwright/test';
import { STORAGE_STATE } from '@config/storageState';
import { LoginPage } from '@pages/LoginPage';
import { users } from '@data/auth.data';

/**
 * Optional login-once setup. Add a `setup` project in playwright.config.ts
 * (testMatch: /.*\.setup\.ts/) and point dependent projects' `storageState` at STORAGE_STATE.
 */
setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate('/login/');
  await loginPage.login(users.appUser.username, users.appUser.password);
  await loginPage.greeting.waitFor();
  await page.context().storageState({ path: STORAGE_STATE });
});
