const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const HeaderComponent = require('./components/HeaderComponent');
const messages = require('../data/messages');

/**
 * CheckoutInformationPage — checkout step one, the shopper details form.
 */
class CheckoutInformationPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.path = '/checkout-step-one.html';

    this.header = new HeaderComponent(page);

    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.errorMessage = page.getByTestId('error');
  }

  /** Open step one directly. */
  async open() {
    await this.goto(this.path);
    await this.waitForVisible(this.firstNameInput);
  }

  /**
   * Populate the form without submitting it.
   * @param {{firstName: string, lastName: string, postalCode: string}} details
   */
  async fillInformation(details) {
    await this.step(
      `Enter shopper details (${details.firstName || '<blank>'} ${details.lastName || '<blank>'}, ${details.postalCode || '<blank>'})`,
      async () => {
        await this.firstNameInput.fill(details.firstName);
        await this.lastNameInput.fill(details.lastName);
        await this.postalCodeInput.fill(details.postalCode);
      }
    );
  }

  /** Submit the form. Does not assert navigation, so negative tests can reuse it. */
  async clickContinue() {
    await this.click(this.continueButton, 'the Continue button');
  }

  /**
   * Fill the form and advance to the order overview.
   * @param {{firstName: string, lastName: string, postalCode: string}} details
   */
  async submitInformation(details) {
    await this.fillInformation(details);
    await this.clickContinue();
    await this.page.waitForURL(/checkout-step-two\.html/);
  }

  /** Abandon checkout and return to the cart. */
  async cancel() {
    await this.step('Cancel checkout', async () => {
      await this.cancelButton.click();
      await this.page.waitForURL(/cart\.html/);
    });
  }

  /** @returns {Promise<string>} the visible validation error */
  async getErrorMessage() {
    return this.getText(this.errorMessage);
  }

  /* ---------------------------------------------------------------------- */
  /* Assertions                                                             */
  /* ---------------------------------------------------------------------- */

  /** Assert step one has loaded. */
  async expectLoaded() {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
    await expect(this.header.pageTitle).toHaveText(messages.titles.checkoutStepOne);
    await expect(this.firstNameInput).toBeVisible();
  }

  /**
   * Assert an exact validation error is shown.
   * @param {string} expectedMessage
   */
  async expectValidationError(expectedMessage) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedMessage);
  }

  /** Assert the form did not advance past step one. */
  async expectStillOnStepOne() {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
    await expect(this.continueButton).toBeVisible();
  }
}

module.exports = CheckoutInformationPage;
