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
