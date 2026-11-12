import { test, expect } from '@fixtures';
import { articlesData } from '@data/articles.data';

test.describe('Articles', () => {
  test(
    'TC7: limits the list to the selected number of items per page',
    { tag: '@regression' },
    async ({ articlesPage }) => {
      await test.step('Wait for the initial article list', async () => {
        await expect(articlesPage.articleTitles.first()).toBeVisible();
      });

      await test.step('Select the smallest page size', async () => {
        await articlesPage.setItemsPerPage(articlesData.smallPageSize);
      });

      await test.step('Verify only that many articles are shown', async () => {
        await expect(articlesPage.articleTitles).toHaveCount(articlesData.smallPageSize);
        await expect(articlesPage.currentPage).toHaveText(articlesData.firstPage);
      });
    },
  );
});
