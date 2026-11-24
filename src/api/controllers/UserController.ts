import { ApiClient } from '@api/client/ApiClient';
import { UsersEndpoints } from '@api/endpoints/users.endpoints';
import { CreateUserPayload, User } from '@api/models/user.model';

export class UserController {
  constructor(private readonly client: ApiClient) {}

  async getAll(): Promise<User[]> {
    return this.client.get<User[]>(UsersEndpoints.base);
  }

  /** Public endpoint: no token needed. */
  async create(payload: CreateUserPayload): Promise<User> {
    return this.client.post<User>(UsersEndpoints.base, payload);
  }

  /** GAD only lets a user delete itself: the client must carry that user's token. */
  async delete(id: number): Promise<void> {
    return this.client.delete(UsersEndpoints.byId(id));
  }
}
