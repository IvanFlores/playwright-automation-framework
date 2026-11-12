import { Locator, Page } from '@playwright/test';

/** Example reusable component object, scoped to a root locator. */
export class NavBar {
  constructor(private readonly page: Page) {}

  get root(): Locator {
    return this.page.getByRole('navigation').first();
  }

  link(name: string | RegExp): Locator {
    return this.root.getByRole('link', { name });
  }

  async goTo(name: string | RegExp): Promise<void> {
    await this.link(name).first().click();
  }
}
