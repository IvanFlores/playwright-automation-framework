import { test, expect } from '@fixtures';
import { buildPost } from '@data/posts.data';

type PostResponse = { id: number; title: string; body: string; userId: number };

test.describe('Posts API', () => {
  test('lists posts @smoke', async ({ api }) => {
    const posts = await api.get<PostResponse[]>('/posts');
    expect(posts.length).toBeGreaterThan(0);
  });

  test('creates a post @regression', async ({ api }) => {
    const payload = buildPost();
    const created = await api.post<PostResponse>('/posts', payload);
    expect(created).toMatchObject(payload);
    expect(created.id).toBeDefined();
  });
});
