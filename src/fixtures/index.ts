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
import { UserController } from '@api/controllers/UserController';
import { Article } from '@api/models/article.model';
import { Comment } from '@api/models/comment.model';
import { WorkerUser } from '@api/models/user.model';
import { Env } from '@config/Env';
import { buildArticle } from '@data/articles.data';
import { buildComment } from '@data/comments.data';
import { users } from '@data/auth.data';
import { buildUser } from '@data/users.data';

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

type WorkerFixtures = {
  workerUser: WorkerUser;
};

/** Import `test` and `expect` from here (`@fixtures`), not from @playwright/test, in every spec. */
export const test = base.extend<Fixtures, WorkerFixtures>({
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

  // Identity owned by this worker (spec-data-standard R1): no other worker creates data as this user.
  // It logs in once; every data fixture of the worker reuses the token (R15). Deleted after the
  // worker's last test, i.e. after every article/comment it created (GAD does not cascade deletes).
  workerUser: [
    async ({ playwright }, use, workerInfo) => {
      const request = await playwright.request.newContext({ baseURL: Env.baseUrl });
      const client = new ApiClient(request);
      const userController = new UserController(client);
      const payload = buildUser(workerInfo.parallelIndex);
      const credentials = { username: payload.email, password: payload.password };
      const created = await userController.create(payload);
      // From here on the user exists: whatever fails, the finally block deletes it. GAD only lets a
      // user delete itself, so a leftover user without its password could never be cleaned up.
      try {
        const token = await new AuthController(client).login(credentials);
        client.setAuthToken(token);
        await use({ ...created, password: payload.password, token });
      } finally {
        client.setAuthToken(await new AuthController(client).login(credentials));
        await userController.delete(created.id);
        await request.dispose();
      }
    },
    { scope: 'worker' },
  ],

  // Precondition: an article of `workerUser` exists (created via API). Postcondition: it is deleted.
  createdArticle: async ({ request, workerUser }, use, testInfo) => {
    const controller = new ArticleController(clientWithToken(request, workerUser.token));
    const article = await controller.create(buildArticle(testInfo.parallelIndex));
    await use(article);
    await controller.delete(article.id);
  },

  // Precondition: a comment of `workerUser` exists on `createdArticle`. Postcondition: the comment is
  // deleted (before the article, because Playwright tears dependent fixtures down first).
  createdComment: async ({ request, workerUser, createdArticle }, use, testInfo) => {
    const controller = new CommentController(clientWithToken(request, workerUser.token));
    const comment = await controller.create(
      buildComment(createdArticle.id, testInfo.parallelIndex),
    );
    await use(comment);
    await controller.delete(comment.id);
  },
});

/** ApiClient on the test's request context, authenticated with an already issued token. */
function clientWithToken(request: APIRequestContext, token: string): ApiClient {
  const client = new ApiClient(request);
  client.setAuthToken(token);
  return client;
}

export { expect };
