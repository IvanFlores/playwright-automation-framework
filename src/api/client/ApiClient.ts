import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * The only HTTP entry point of the framework: wraps Playwright's APIRequestContext.
 * Paths are resolved against the request context's baseURL. Non-2xx responses throw.
 */
export class ApiClient {
  private authToken?: string;

  constructor(private readonly request: APIRequestContext) {}

  /** Sends `Authorization: Bearer <token>` on every following request. */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  async get<T>(url: string, params?: Record<string, string | number>): Promise<T> {
    const response = await this.request.get(url, { params, headers: this.headers() });
    return this.parse<T>('GET', url, response);
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.request.post(url, { data, headers: this.headers() });
    return this.parse<T>('POST', url, response);
  }

  async put<T>(url: string, data: unknown): Promise<T> {
    const response = await this.request.put(url, { data, headers: this.headers() });
    return this.parse<T>('PUT', url, response);
  }

  async delete(url: string): Promise<void> {
    const response = await this.request.delete(url, { headers: this.headers() });
    await this.ensureOk('DELETE', url, response);
  }

  private headers(): Record<string, string> {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }

  private async ensureOk(method: string, url: string, response: APIResponse): Promise<void> {
    if (!response.ok()) {
      const body = await response.text().catch(() => '');
      throw new Error(`${method} ${url} failed — status ${response.status()}: ${body}`);
    }
  }

  private async parse<T>(method: string, url: string, response: APIResponse): Promise<T> {
    await this.ensureOk(method, url, response);
    return (await response.json()) as T;
  }
}
