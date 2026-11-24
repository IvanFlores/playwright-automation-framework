import { CreateCommentPayload } from '@api/models/comment.model';
import { Env } from '@config/Env';
import { gadPastDate, uniqueSuffix } from '@data/factory.data';

/** Comment for `articleId`, with a unique, prefixed body so the UI assertion can only match it. */
export const buildComment = (
  articleId: number,
  parallelIndex: number,
  overrides: Partial<CreateCommentPayload> = {},
): CreateCommentPayload => ({
  article_id: articleId,
  body: `${Env.testDataPrefix}comment ${uniqueSuffix(parallelIndex)}`,
  date: gadPastDate(),
  ...overrides,
});
