import { test, expect } from '@fixtures';
import { users } from '@data/auth.data';

test.describe('Home', () => {
  test('TC3: shows the signed-in user greeting', { tag: '@smoke' }, async ({ homePage }) => {
    await test.step('Verify the greeting shows the user email', async () => {
      await expect(homePage.greeting).toContainText(users.appUser.username);
    });
  });
});
