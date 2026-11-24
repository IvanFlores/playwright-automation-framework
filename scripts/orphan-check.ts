import { request } from '@playwright/test';
import { ApiClient } from '@api/client/ApiClient';
import { ArticleController } from '@api/controllers/ArticleController';
import { CommentController } from '@api/controllers/CommentController';
import { UserController } from '@api/controllers/UserController';
import { Env } from '@config/Env';

/**
 * spec-data-standard M5 orphan check: lists GAD records whose text starts with Env.testDataPrefix.
 * Exit code 1 when any exists. Usage: `npm run data:orphans`.
 */
async function main(): Promise<void> {
  const context = await request.newContext({ baseURL: Env.baseUrl });
  const client = new ApiClient(context);
  const prefix = Env.testDataPrefix;
  const [users, articles, comments] = await Promise.all([
    new UserController(client).getAll(),
    new ArticleController(client).getAll(),
    new CommentController(client).getAll(),
  ]);
  await context.dispose();

  const orphans = {
    users: users.filter((u) => u.firstname.startsWith(prefix)).map((u) => u.id),
    articles: articles.filter((a) => a.title.startsWith(prefix)).map((a) => a.id),
    comments: comments.filter((c) => c.body.startsWith(prefix)).map((c) => c.id),
  };
  const total = orphans.users.length + orphans.articles.length + orphans.comments.length;
  console.log(
    `[orphans] ${Env.baseUrl} prefix '${prefix}' — users ${orphans.users.length} · ` +
      `articles ${orphans.articles.length} · comments ${orphans.comments.length}`,
  );
  if (total > 0) console.log(JSON.stringify(orphans));
  process.exitCode = total > 0 ? 1 : 0;
}

void main();
