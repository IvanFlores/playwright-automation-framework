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

  /** Text of comment `commentId`: the value next to the "comment:" label of its card. */
  commentBody(commentId: number) {
    return this.commentField(commentId, 'comment:');
  }

  /** Author link of comment `commentId`: the link next to the "author:" label of its card. */
  commentAuthor(commentId: number) {
    return this.commentField(commentId, 'author:').getByRole('link');
  }

  /** Comment card containing the "See More..." link of comment `commentId`. */
  commentCard(commentId: number) {
    // locator: GAD comment cards have no role, label or data-testid (markup request, ADR-005);
    // `gotoComment<id>` is built from the id of the comment the test created, so it is deterministic.
    return this.page
      .locator('.comment-container')
      .filter({ has: this.page.locator(`#gotoComment${commentId}`) });
  }

  /** Value cell next to a `<label>` of the comment card (GAD renders `label + span` pairs). */
  private commentField(commentId: number, label: string) {
    // locator: no role or test id on the label/value pair; adjacent sibling of an exact label text.
    return this.commentCard(commentId).locator(`label:text-is("${label}") + span`);
  }
}
