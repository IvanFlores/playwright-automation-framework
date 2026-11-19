import { CreateArticlePayload } from '@api/models/article.model';

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

/** Unique per call, so parallel workers never collide on titles or bodies. */
export const uniqueSuffix = (): string => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

/**
 * GAD rejects a `date` later than its own clock and only accepts `YYYY-MM-DDTHH:mm:ssZ`
 * (no milliseconds). One day in the past is safe whatever the server's time zone is.
 */
export const gadPastDate = (): string =>
  `${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19)}Z`;

/** Article payload for API setup; the title is unique so a search matches exactly this article. */
export const buildArticle = (overrides: Partial<CreateArticlePayload> = {}): CreateArticlePayload => {
  const suffix = uniqueSuffix();
  return {
    title: `Lifecycle article ${suffix}`,
    body: `Created through the API as a test precondition (${suffix}).`,
    date: gadPastDate(),
    image: '',
    ...overrides,
  };
};
