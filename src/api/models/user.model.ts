/** User as returned by GAD (`email` is masked as `****` for anonymous reads). */
export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  avatar: string;
}

export interface CreateUserPayload {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  avatar: string;
}

/** Identity owned by one Playwright worker (`workerUser` fixture): the created user + its only token. */
export interface WorkerUser extends User {
  password: string;
  token: string;
}
