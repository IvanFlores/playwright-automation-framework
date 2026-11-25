import { test, expect } from '@fixtures';
import { articlesData } from '@data/articles.data';

/** Specification: docs/test-cases/gad/articles-test-cases.md (TC6). */
test.describe('Articles', () => {
  test(
    'TC6: shows a no-data message when the search matches no article',
    { tag: ['@regression', '@read-only'] },
    async ({ articlesPage, articleController }) => {
      await test.step('Verify through the API that no article matches the term', async () => {
        expect(await articleController.search(articlesData.noMatchSearchTerm)).toHaveLength(0);
      });

      await test.step('Wait for the initial article list', async () => {
        await expect(articlesPage.articleTitles.first()).toBeVisible();
      });

      await test.step('Search the term and verify the no-data state', async () => {
        await articlesPage.search(articlesData.noMatchSearchTerm);
        await expect(articlesPage.noResultsMessage).toHaveText(articlesData.noResultsMessage);
        await expect(articlesPage.articleTitles).toHaveCount(0);
        await expect(articlesPage.currentPage).toHaveText(articlesData.emptyResultPage);
        await expect(articlesPage.totalPages).toHaveText(articlesData.emptyResultPage);
      });
    },
  );
});
