import { test, expect } from '@fixtures';
import { articlesData, pageCountFor } from '@data/articles.data';

/**
 * Specification: docs/test-cases/gad/articles-test-cases.md (TC7).
 * TC8/TC9 change the article total in parallel, so the page-count check reloads the list,
 * selects the page size again and re-reads the API until both agree (Q10 in the spec).
 */
test.describe('Articles', () => {
  test(
    'TC7: limits the list to the selected number of items per page',
    { tag: ['@regression', '@read-only'] },
    async ({ articlesPage, articleController }) => {
      const { smallPageSize, firstPage } = articlesData;

      await test.step('Verify enough articles exist to fill a page of the selected size', async () => {
        expect((await articleController.getAll()).length).toBeGreaterThanOrEqual(smallPageSize);
      });

      await test.step('Wait for the initial article list', async () => {
        await expect(articlesPage.articleTitles.first()).toBeVisible();
      });

      await test.step('Select the smallest page size and verify the list', async () => {
        await articlesPage.setItemsPerPage(smallPageSize);
        await expect(articlesPage.articleTitles).toHaveCount(smallPageSize);
        await expect(articlesPage.currentPage).toHaveText(firstPage);
      });

      await test.step('Verify the page count matches the article total', async () => {
        await expect(async () => {
          await articlesPage.reload();
          await articlesPage.setItemsPerPage(smallPageSize);
          await expect(articlesPage.articleTitles).toHaveCount(smallPageSize, { timeout: 1_000 });
          const total = (await articleController.getAll()).length;
          await expect(articlesPage.totalPages).toHaveText(
            String(pageCountFor(total, smallPageSize)),
            { timeout: 1_000 },
          );
        }).toPass({ timeout: 15_000 });
      });
    },
  );
});
