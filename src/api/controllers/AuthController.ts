import { ApiClient } from '@api/client/ApiClient';
import { AuthEndpoints } from '@api/endpoints/auth.endpoints';
import { LoginPayload, LoginResponse } from '@api/models/auth.model';

export class AuthController {
  constructor(private readonly client: ApiClient) {}

  /** Logs in and returns the bearer token. */
  async login(credentials: { username: string; password: string }): Promise<string> {
    const payload: LoginPayload = { email: credentials.username, password: credentials.password };
    const { access_token } = await this.client.post<LoginResponse>(AuthEndpoints.login, payload);
    return access_token;
  }
}
