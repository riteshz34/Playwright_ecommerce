const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const HeaderComponent = require('./components/HeaderComponent');
const { ORDER_CONFIRMATION } = require('../data/checkout-data');
const messages = require('../data/messages');

/**
 * CheckoutCompletePage — the order confirmation screen, end of the happy path.
 */
class CheckoutCompletePage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.path = '/checkout-complete.html';

    this.header = new HeaderComponent(page);

    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.ponyExpressImage = page.getByTestId('pony-express');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  /** Return to the catalogue after ordering. */
  async backToProducts() {
    await this.step('Return to the catalogue after ordering', async () => {
      await this.backHomeButton.click();
      await this.page.waitForURL(/inventory\.html/);
    });
  }

  /** @returns {Promise<string>} the confirmation heading */
  async getConfirmationHeader() {
    return this.getText(this.completeHeader);
  }

  /* ---------------------------------------------------------------------- */
  /* Assertions                                                             */
  /* ---------------------------------------------------------------------- */

  /** Assert the confirmation screen has loaded. */
  async expectLoaded() {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.header.pageTitle).toHaveText(messages.titles.checkoutComplete);
  }

  /**
   * Assert the full order-confirmation contract: heading, body copy, artwork,
   * and - crucially - that the cart was emptied by placing the order.
   */
  async expectOrderConfirmed() {
    await expect(this.completeHeader).toHaveText(ORDER_CONFIRMATION.header);
    await expect(this.completeText).toHaveText(ORDER_CONFIRMATION.text);
    await expect(this.ponyExpressImage).toBeVisible();
    await expect(this.backHomeButton).toBeEnabled();
    await this.header.expectCartCount(0);
  }
}

module.exports = CheckoutCompletePage;
