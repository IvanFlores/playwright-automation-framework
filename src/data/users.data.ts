import { CreateUserPayload, User } from '@api/models/user.model';
import { Env } from '@config/Env';
import { uniqueSuffix } from '@data/factory.data';

/** Avatar file shipped inside the GAD image (required by POST /api/users). */
const GAD_DEFAULT_AVATAR = ['.', 'data', 'users', 'face_1591133479.7144732.jpg'].join('\\');

/**
 * One throwaway GAD account per worker. The firstname carries the prefix and is unique, because
 * anonymous reads mask `email` and `lastname`: it is the only public field that identifies the user.
 */
export const buildUser = (parallelIndex: number): CreateUserPayload => {
  const suffix = uniqueSuffix(parallelIndex);
  return {
    email: `${Env.testDataPrefix}user-${suffix}@example.test`,
    firstname: `${Env.testDataPrefix}w${parallelIndex}${Math.random().toString(36).slice(2, 7)}`,
    lastname: 'worker',
    password: `pw-${Math.random().toString(36).slice(2)}${Date.now()}`,
    avatar: GAD_DEFAULT_AVATAR,
  };
};

/** GAD shows `****` instead of the last name to visitors who are not logged in. */
export const MASKED_LASTNAME = '****';

/** Author name as GAD renders it to an anonymous visitor: `<firstname> ****`. */
export const publicName = (user: Pick<User, 'firstname'>): string =>
  `${user.firstname} ${MASKED_LASTNAME}`;
