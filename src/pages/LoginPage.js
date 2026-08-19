const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const config = require('../../config');

/**
 * LoginPage — the application entry point.
 *
 * Exposes business-level actions (`login`, `expectLoginError`) rather than raw
 * element access. A spec should read "log in as the locked-out user, expect the
 * lock-out error", never "fill #user-name, click #login-button".
 */
class LoginPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.path = '/';

    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
    this.errorCloseButton = page.locator('.error-button');
    this.loginLogo = page.locator('.login_logo');
    this.credentialsPanel = page.getByTestId('login-credentials');
  }

  /** Open the login screen. */
  async open() {
    await this.goto(this.path);
    await this.waitForVisible(this.loginButton);
  }

  /**
   * Enter credentials and submit.
   *
   * Deliberately does *not* assert success: negative tests reuse this method and
   * then assert on the error banner. Use {@link loginAsStandardUser} for the
   * happy path where landing on the catalogue is part of the contract.
   *
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.step(`Log in as "${username}"`, async () => {
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
    });
  }

  /**
   * Log in with one of the configured users.
   * @param {keyof typeof config.users} userKey e.g. 'standard', 'problem'
   */
  async loginAs(userKey) {
    const user = config.users[userKey];
    if (!user) {
      throw new Error(
        `Unknown user "${userKey}". Available: ${Object.keys(config.users).join(', ')}`
      );
    }
    await this.login(user.username, user.password);
  }

  /** Happy-path login that also waits for the catalogue to load. */
  async loginAsStandardUser() {
    await this.loginAs('standard');
    await this.page.waitForURL(/inventory\.html/);
  }

  /** @returns {Promise<string>} the visible error banner text */
  async getErrorMessage() {
    return this.getText(this.errorMessage);
  }

  /** Dismiss the error banner with its X button. */
  async closeErrorMessage() {
    await this.click(this.errorCloseButton, 'the error banner close button');
  }

  /* ---------------------------------------------------------------------- */
  /* Assertions                                                             */
  /* ---------------------------------------------------------------------- */

  /** Assert the login form is rendered and ready. */
  async expectLoaded() {
    await expect(this.loginLogo).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeEnabled();
  }

  /**
   * Assert an exact error message is displayed.
   * @param {string} expectedMessage
   */
  async expectLoginError(expectedMessage) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedMessage);
  }

  /** Assert no error banner is present. */
  async expectNoError() {
    await expect(this.errorMessage).toHaveCount(0);
  }

  /** Assert the user is still on the login screen (i.e. login was rejected). */
  async expectStillOnLoginPage() {
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).not.toHaveURL(/inventory\.html/);
  }

  /**
   * Assert both credential fields render as flagged/invalid.
   * The application marks rejected inputs with the `error` CSS class.
   */
  async expectFieldsFlaggedAsInvalid() {
    await expect(this.usernameInput).toHaveClass(/error/);
    await expect(this.passwordInput).toHaveClass(/error/);
  }
}

module.exports = LoginPage;
