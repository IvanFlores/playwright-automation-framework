import { test, expect } from '@fixtures';

/** Specification: docs/test-cases/gad/articles-test-cases.md (TC8) — preconditions, data, cleanup. */
test.describe('Articles', () => {
  test(
    'TC8: finds an article created through the API by searching its title',
    { tag: ['@smoke', '@mutates-data'] },
    async ({ createdArticle, articlesPage }) => {
      await test.step('Verify the article list is loaded with an empty search', async () => {
        await expect(articlesPage.articleTitles).not.toHaveCount(0);
        await expect(articlesPage.searchInput).toBeEmpty();
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
