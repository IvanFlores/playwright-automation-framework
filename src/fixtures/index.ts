import { APIRequestContext, test as base, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { HomePage } from '@pages/HomePage';
import { ArticlesPage } from '@pages/ArticlesPage';
import { ArticlePage } from '@pages/ArticlePage';
import { ApiClient } from '@api/client/ApiClient';
import { AuthController } from '@api/controllers/AuthController';
import { ArticleController } from '@api/controllers/ArticleController';
import { CommentController } from '@api/controllers/CommentController';
import { PostController } from '@api/controllers/PostController';
import { Article } from '@api/models/article.model';
import { Comment } from '@api/models/comment.model';
import { buildArticle } from '@data/articles.data';
import { buildComment } from '@data/comments.data';
import { users } from '@data/auth.data';

type Fixtures = {
  authenticatedPage: LoginPage;
  loginPage: LoginPage;
  homePage: HomePage;
  articlesPage: ArticlesPage;
  articlePage: ArticlePage;
  postController: PostController;
  createdArticle: Article;
  createdComment: Comment;
};

/** Import `test` and `expect` from here (`@fixtures`), not from @playwright/test, in every spec. */
export const test = base.extend<Fixtures>({
  // WebKit applies the app's CSP `upgrade-insecure-requests` to localhost (Chromium/Firefox don't),
  // rewriting every request to https:// on a plain-HTTP server, so nothing loads and forms never submit.
  // Strip that directive for WebKit when the app is served over HTTP.
  context: async ({ context, browserName, baseURL }, use) => {
    if (browserName === 'webkit' && baseURL?.startsWith('http://')) {
      await context.route(`${new URL(baseURL).origin}/**`, async (route) => {
        // CSP only takes effect on documents; let every other request through untouched.
        if (route.request().resourceType() !== 'document') {
          return route.continue();
        }
        try {
          const response = await route.fetch();
          const headers = response.headers();
          const csp = headers['content-security-policy'];
          if (csp) {
            headers['content-security-policy'] = csp.replace(/;?\s*upgrade-insecure-requests/i, '');
          }
          await route.fulfill({ response, headers });
        } catch {
          // The navigation was superseded or the context closed mid-request; nothing to fulfil.
        }
      });
    }
    await use(context);
    await context.unrouteAll({ behavior: 'ignoreErrors' });
  },

  // Logs in with the default test account; Playwright discards the context after each test.
  authenticatedPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await lp.navigate('/login/');
    await lp.login(users.appUser.username, users.appUser.password);
    await use(lp);
  },

  // No auth: login form ready to fill.
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login/');
    await use(loginPage);
  },

  // Auth required — post-login landing page, so no extra navigate().
  homePage: async ({ page, authenticatedPage }, use) => {
    void authenticatedPage; // dependency only: guarantees login ran on this `page`
    await use(new HomePage(page));
  },

  // No auth: the article list is public.
  articlesPage: async ({ page }, use) => {
    const articlesPage = new ArticlesPage(page);
    await articlesPage.navigate('/articles.html');
    await use(articlesPage);
  },

  // Auth not required: an article page is public. Opens the article created by the precondition.
  articlePage: async ({ page, createdArticle }, use) => {
    const articlePage = new ArticlePage(page);
    await articlePage.navigate(`/article.html?id=${createdArticle.id}`);
    await use(articlePage);
  },

  // ── API lifecycle fixtures (lifecycle-architect) ─────────────────────────────

  // Controller fixture for the `api` project (JSONPlaceholder, read/echo only — nothing to clean up).
  postController: async ({ request }, use) => {
    await use(new PostController(new ApiClient(request)));
  },

  // Precondition: an article exists (created via API). Postcondition: it is deleted via API.
  createdArticle: async ({ request }, use) => {
    const controller = new ArticleController(await gadClient(request));
    const article = await controller.create(buildArticle());
    await use(article);
    await controller.delete(article.id);
  },

  // Precondition: a comment exists on `createdArticle`. Postcondition: the comment is deleted
  // (before the article, because Playwright tears dependent fixtures down first).
  createdComment: async ({ request, createdArticle }, use) => {
    const controller = new CommentController(await gadClient(request));
    const comment = await controller.create(buildComment(createdArticle.id));
    await use(comment);
    await controller.delete(comment.id);
  },
});

/** ApiClient for GAD authenticated as the default test account. */
async function gadClient(request: APIRequestContext): Promise<ApiClient> {
  const client = new ApiClient(request);
  client.setAuthToken(await new AuthController(client).login(users.appUser));
  return client;
}

export { expect };
