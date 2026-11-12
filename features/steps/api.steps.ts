import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { buildPost } from '@data/posts.data';
import { CustomWorld } from '../support/world';

type PostResponse = { id: number; title: string; body: string; userId: number };

When('I request the list of posts', async function (this: CustomWorld) {
  this.data.posts = await this.api.get<PostResponse[]>('/posts');
});

Then('at least {int} post(s) is/are returned', function (this: CustomWorld, min: number) {
  expect((this.data.posts as PostResponse[]).length).toBeGreaterThanOrEqual(min);
});

When('I create a post with generated data', async function (this: CustomWorld) {
  this.data.payload = buildPost();
  this.data.created = await this.api.post<PostResponse>('/posts', this.data.payload);
});

Then('the created post echoes the submitted data', function (this: CustomWorld) {
  expect(this.data.created).toMatchObject(this.data.payload as Record<string, unknown>);
});

Then('the created post has an id', function (this: CustomWorld) {
  expect((this.data.created as PostResponse).id).toBeDefined();
});
