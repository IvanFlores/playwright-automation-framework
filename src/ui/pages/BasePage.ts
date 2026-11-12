import { Page } from '@playwright/test';

/** Shared behaviour for every Page Object. Locators and actions live in subclasses; assertions live in specs. */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navigates relative to `baseURL` (configured in playwright.config.ts from BASE_URL). */
  async navigate(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }
}
