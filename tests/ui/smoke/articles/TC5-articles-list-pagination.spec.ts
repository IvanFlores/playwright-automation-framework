import { test, expect } from '@fixtures';
import { articlesData } from '@data/articles.data';

test.describe('Articles', () => {
  test(
    'TC5: lists articles starting on the first page',
    { tag: '@smoke' },
    async ({ articlesPage }) => {
      await test.step('Verify the article list is populated', async () => {
        await expect(articlesPage.articleTitles.first()).toBeVisible();
      });

      await test.step('Verify pagination starts on the first page', async () => {
        await expect(articlesPage.currentPage).toHaveText(articlesData.firstPage);
        await expect(articlesPage.totalPages).toHaveText(/^\d+$/);
      });
    },
  );
});
