import { test, expect } from '@fixtures';
import { articlesData, pageCountFor } from '@data/articles.data';

/**
 * Specification: docs/test-cases/gad/articles-test-cases.md (TC5).
 * The article total is shared with TC8/TC9, which add and delete articles in parallel. The page
 * does not update by itself, so the retried block reloads the list AND re-reads the API until
 * both describe the same total (Q10 in the spec).
 */
test.describe('Articles', () => {
  test(
    'TC5: lists articles starting on the first page',
    { tag: ['@smoke', '@read-only'] },
    async ({ articlesPage, articleController }) => {
      const { defaultPageSize, firstPage } = articlesData;

      await test.step('Verify enough articles exist for a full first page', async () => {
        expect((await articleController.getAll()).length).toBeGreaterThanOrEqual(defaultPageSize);
      });

      await test.step('Verify the first page shows the default number of articles', async () => {
        await expect(articlesPage.articleTitles).toHaveCount(defaultPageSize);
      });

      await test.step('Verify pagination starts on page 1 with the page count the total needs', async () => {
        await expect(articlesPage.currentPage).toHaveText(firstPage);
        await expect(async () => {
          await articlesPage.reload();
          const total = (await articleController.getAll()).length;
          await expect(articlesPage.totalPages).toHaveText(
            String(pageCountFor(total, defaultPageSize)),
            { timeout: 1_000 },
          );
        }).toPass({ timeout: 15_000 });
      });
    },
  );
});
