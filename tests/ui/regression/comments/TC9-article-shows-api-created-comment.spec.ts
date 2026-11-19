import { test, expect } from '@fixtures';

/**
 * Preconditions (API):  `createdArticle` (POST /api/articles) and `createdComment` on it
 *                       (POST /api/comments), both authenticated with a token from POST /api/login.
 * Postconditions (API): DELETE /api/comments/:id, then DELETE /api/articles/:id
 *                       (Playwright tears the dependent fixture down first).
 * `createdComment` is listed before `articlePage` so the comment exists before the page loads.
 */
test.describe('Comments', () => {
  test(
    'TC9: shows a comment created through the API on its article page',
    { tag: '@regression' },
    async ({ createdArticle, createdComment, articlePage }) => {
      await test.step('Verify the API-created article is displayed', async () => {
        await expect(articlePage.title).toHaveText(createdArticle.title);
        await expect(articlePage.body).toHaveText(createdArticle.body);
      });

      await test.step('Verify the API-created comment is listed under the article', async () => {
        const comment = articlePage.commentCard(createdComment.id);
        await expect(comment).toBeVisible();
        await expect(comment).toContainText(createdComment.body);
      });
    },
  );
});
