import { CreateArticlePayload } from '@api/models/article.model';
import { Env } from '@config/Env';
import { gadPastDate, uniqueSuffix } from '@data/factory.data';

/** Test data for the GAD articles list (`/articles.html`). */
export const articlesData = {
  /** Search term that no seeded article contains. */
  noMatchSearchTerm: 'zzqx-no-matching-article',
  /** Message rendered when a search returns nothing. */
  noResultsMessage: 'No data',
  /** Value shown on the pagination control for the first page. */
  firstPage: '1',
  /** Smallest "Items/Page" option offered by the list. */
  smallPageSize: 3,
} as const;

/** Article payload for API setup: prefixed and unique, so a search matches exactly this article. */
export const buildArticle = (
  parallelIndex: number,
  overrides: Partial<CreateArticlePayload> = {},
): CreateArticlePayload => {
  const suffix = uniqueSuffix(parallelIndex);
  return {
    title: `${Env.testDataPrefix}article ${suffix}`,
    body: `${Env.testDataPrefix}body ${suffix}`,
    date: gadPastDate(),
    image: '',
    ...overrides,
  };
};
