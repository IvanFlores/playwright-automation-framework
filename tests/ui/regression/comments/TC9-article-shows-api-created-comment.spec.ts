import { test, expect } from '@fixtures';
import { publicName } from '@data/users.data';

/**
 * Specification: docs/test-cases/gad/comments-test-cases.md (TC9) — preconditions, data, cleanup.
 * `createdComment` is listed before `articlePage` so the comment exists before the page loads.
 */
test.describe('Comments', () => {
  test(
    'TC9: shows a comment created through the API on its article page',
    { tag: ['@regression', '@mutates-data'] },
    async ({ workerUser, createdArticle, createdComment, articlePage }) => {
      await test.step('Verify the API-created article is displayed', async () => {
        await expect(articlePage.title).toHaveText(createdArticle.title);
        await expect(articlePage.body).toHaveText(createdArticle.body);
        await expect(articlePage.author).toHaveText(publicName(workerUser));
      });

      await test.step('Verify the API-created comment is listed under the article', async () => {
        await expect(articlePage.commentBody(createdComment.id)).toHaveText(createdComment.body);
        await expect(articlePage.commentAuthor(createdComment.id)).toHaveText(
          publicName(workerUser),
        );
      });
    },
  );
});
