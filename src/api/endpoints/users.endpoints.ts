/** GAD users API. */
export const UsersEndpoints = {
  base: '/api/users',
  byId: (id: number) => `/api/users/${id}`,
} as const;
