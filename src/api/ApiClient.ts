import { APIRequestContext, APIResponse, expect } from '@playwright/test';

/** Thin wrapper over APIRequestContext for test data setup/teardown and API tests. */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async get<T>(url: string, params?: Record<string, string | number>): Promise<T> {
    return this.json<T>(await this.request.get(url, { params }));
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    return this.json<T>(await this.request.post(url, { data }));
  }

  async put<T>(url: string, data: unknown): Promise<T> {
    return this.json<T>(await this.request.put(url, { data }));
  }

  async delete(url: string): Promise<void> {
    const response = await this.request.delete(url);
    expect(response.ok(), `DELETE ${url} -> ${response.status()}`).toBeTruthy();
  }

  private async json<T>(response: APIResponse): Promise<T> {
    expect(response.ok(), `${response.url()} -> ${response.status()}`).toBeTruthy();
    return (await response.json()) as T;
  }
}
