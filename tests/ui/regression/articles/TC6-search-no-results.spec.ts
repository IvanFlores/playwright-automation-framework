import { test, expect } from '@fixtures';
import { articlesData } from '@data/articles.data';

test.describe('Articles', () => {
  test(
    'TC6: shows a no-data message when the search matches no article',
    { tag: '@regression' },
    async ({ articlesPage }) => {
      await test.step('Wait for the initial article list', async () => {
        await expect(articlesPage.articleTitles.first()).toBeVisible();
      });

      await test.step('Search for a term no article contains', async () => {
        await articlesPage.search(articlesData.noMatchSearchTerm);
      });

      await test.step('Verify the no-data message replaces the list', async () => {
        await expect(articlesPage.noResultsMessage).toHaveText(articlesData.noResultsMessage);
        await expect(articlesPage.articleTitles).toHaveCount(0);
      });
    },
  );
});
