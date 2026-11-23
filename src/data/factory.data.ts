/**
 * Building blocks for data factories (spec-data-standard R2).
 * `parallelIndex` keeps values unique across workers; timestamp + random keep them unique across runs.
 */
export const uniqueSuffix = (parallelIndex: number): string =>
  `${parallelIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * GAD rejects a `date` later than its own clock and only accepts `YYYY-MM-DDTHH:mm:ssZ`
 * (no milliseconds). One day in the past is safe whatever the server's time zone is.
 */
export const gadPastDate = (): string =>
  `${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19)}Z`;
