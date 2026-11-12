import { BasePage } from '@pages/BasePage';

/** Landing page shown after a successful login. */
export class HomePage extends BasePage {
  get greeting() {
    return this.page.getByTestId('hello');
  }

  get userMenuButton() {
    return this.page.getByTestId('btn-dropdown');
  }
}
