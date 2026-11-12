import { BasePage } from '@pages/BasePage';

/** Public article list of GAD, served at `/articles.html`. */
export class ArticlesPage extends BasePage {
  /** Title of every article card currently rendered (`article-<id>-title`). */
  get articleTitles() {
    return this.page.locator('[data-testid^="article-"][data-testid$="-title"]');
  }

  get searchInput() {
    return this.page.getByTestId('search-input');
  }

  get searchButton() {
    return this.page.getByTestId('search-button');
  }

  get noResultsMessage() {
    return this.page.getByTestId('no-results');
  }

  get currentPage() {
    return this.page.getByTestId('current-page');
  }

  get totalPages() {
    return this.page.getByTestId('total-pages');
  }

  get itemsPerPageSelect() {
    return this.page.getByTestId('per-page-select');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async setItemsPerPage(count: number): Promise<void> {
    await this.itemsPerPageSelect.selectOption(String(count));
  }
}
