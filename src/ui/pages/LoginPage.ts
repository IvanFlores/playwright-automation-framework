import { BasePage } from '@pages/BasePage';

/** Login page of the application under test (GAD), served at `/login/`. */
export class LoginPage extends BasePage {
  get emailInput() {
    return this.page.getByRole('textbox', { name: 'Enter User Email' });
  }

  get passwordInput() {
    return this.page.getByRole('textbox', { name: 'Enter Password' });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'LogIn' });
  }

  /** Error shown after a failed login attempt. */
  get errorMessage() {
    return this.page.getByTestId('login-error');
  }

  /** Post-login: greeting that shows the signed-in user's email. */
  get greeting() {
    return this.page.getByTestId('hello');
  }

  /** Post-login: user menu toggle. */
  get userMenuButton() {
    return this.page.getByTestId('btn-dropdown');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
