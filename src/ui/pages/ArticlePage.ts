import { BasePage } from '@pages/BasePage';

/** Single article view of GAD, served at `/article.html?id=<id>`. */
export class ArticlePage extends BasePage {
  get title() {
    return this.page.getByTestId('article-title');
  }

  get body() {
    return this.page.getByTestId('article-body');
  }

  /** Comment card containing the "See More..." link of comment `commentId`. */
  commentCard(commentId: number) {
    return this.page
      .locator('.comment-container')
      .filter({ has: this.page.locator(`#gotoComment${commentId}`) });
  }
}
