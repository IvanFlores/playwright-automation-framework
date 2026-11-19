/** GAD articles API. */
export const ArticlesEndpoints = {
  base: '/api/articles',
  byId: (id: number) => `/api/articles/${id}`,
} as const;
