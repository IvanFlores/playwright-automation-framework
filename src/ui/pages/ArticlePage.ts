import { BasePage } from '@pages/BasePage';

/** Single article view of GAD, served at `/article.html?id=<id>`. */
export class ArticlePage extends BasePage {
  get title() {
    return this.page.getByTestId('article-title');
  }

  get body() {
    return this.page.getByTestId('article-body');
  }

  get author() {
    return this.page.getByTestId('user-name');
  }

  /** Text of comment `commentId` (the span after the "comment:" label of its card). */
  commentBody(commentId: number) {
    return this.commentCard(commentId).locator(
      'xpath=.//label[normalize-space()="comment:"]/following-sibling::span[1]',
    );
  }

  /** Author link of comment `commentId` (`gotoUser<commentId>-<userId>`). */
  commentAuthor(commentId: number) {
    return this.commentCard(commentId).locator(`[id^="gotoUser${commentId}-"]`);
  }

  /** Comment card containing the "See More..." link of comment `commentId`. */
  commentCard(commentId: number) {
    return this.page
      .locator('.comment-container')
      .filter({ has: this.page.locator(`#gotoComment${commentId}`) });
  }
}
