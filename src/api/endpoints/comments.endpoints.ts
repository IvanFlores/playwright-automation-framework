/** GAD comments API. */
export const CommentsEndpoints = {
  base: '/api/comments',
  byId: (id: number) => `/api/comments/${id}`,
} as const;
