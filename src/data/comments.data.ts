import { CreateCommentPayload } from '@api/models/comment.model';
import { gadPastDate, uniqueSuffix } from '@data/articles.data';

/** Comment for `articleId`, with a unique body so the UI assertion can only match this comment. */
export const buildComment = (
  articleId: number,
  overrides: Partial<CreateCommentPayload> = {},
): CreateCommentPayload => ({
  article_id: articleId,
  body: `Lifecycle comment ${uniqueSuffix()}`,
  date: gadPastDate(),
  ...overrides,
});
