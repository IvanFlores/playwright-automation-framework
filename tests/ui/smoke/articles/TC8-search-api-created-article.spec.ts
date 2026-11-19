import { test, expect } from '@fixtures';

/**
 * Precondition (API):  `createdArticle` — logs in via POST /api/login and creates a uniquely titled
 *                      article via POST /api/articles.
 * Postcondition (API): the same fixture deletes it via DELETE /api/articles/:id after the test.
 */
test.describe('Articles', () => {
  test(
    'TC8: finds an article created through the API by searching its title',
    { tag: '@smoke' },
    async ({ createdArticle, articlesPage }) => {
      await test.step('Wait for the initial article list', async () => {
        await expect(articlesPage.articleTitles.first()).toBeVisible();
      });

      await test.step('Search for the title of the API-created article', async () => {
        await articlesPage.search(createdArticle.title);
      });

      await test.step('Verify the list shows only that article', async () => {
        await expect(articlesPage.articleTitles).toHaveCount(1);
        await expect(articlesPage.articleTitles).toHaveText(createdArticle.title);
      });
    },
  );
});
