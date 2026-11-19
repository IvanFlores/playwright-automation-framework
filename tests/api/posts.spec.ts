import { test, expect } from '@fixtures';
import { buildPost } from '@data/posts.data';

test.describe('Posts API', () => {
  test('lists posts @smoke', async ({ postController }) => {
    const posts = await postController.getAll();
    expect(posts.length).toBeGreaterThan(0);
  });

  test('creates a post @regression', async ({ postController }) => {
    const payload = buildPost();
    const created = await postController.create(payload);
    expect(created).toMatchObject({ ...payload });
    expect(created.id).toBeDefined();
  });
});
