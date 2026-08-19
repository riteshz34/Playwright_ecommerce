const { expect } = require('@playwright/test');
const BasePage = require('../BasePage');
const messages = require('../../data/messages');

/**
 * HeaderComponent — the persistent top bar (logo, cart badge, burger menu).
 *
 * Modelled as a *component* rather than duplicated across every page object,
 * because it appears identically on six different screens. Concrete pages
 * compose it (`this.header = new HeaderComponent(page)`), which is composition
 * over inheritance: pages inherit generic verbs from BasePage and compose
 * reusable UI regions.
 */
class HeaderComponent extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.appLogo = page.locator('.app_logo');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.pageTitle = page.getByTestId('title');

    /* The burger *button* must be clicked, not the icon: the `open-menu`
       test id belongs to an <img> that the surrounding <button> covers, so
       clicking the image is intercepted. Verified against the live DOM. */
    this.burgerButton = page.locator('#react-burger-menu-btn');
  }

  /**
   * Number of items shown on the cart badge.
   * @returns {Promise<number>} 0 when the badge is absent (empty cart)
   */
  async getCartItemCount() {
    if ((await this.cartBadge.count()) === 0) return 0;
    return Number.parseInt(await this.getText(this.cartBadge), 10);
  }

  /** Open the cart page via the header icon. */
  async openCart() {
    await this.click(this.cartLink, 'the shopping cart icon');
  }

  /** Open the slide-out navigation menu and wait for it to finish animating. */
  async openMenu() {
    await this.step('Open the burger navigation menu', async () => {
      await this.burgerButton.click();
      /* The menu slides in via CSS transform. Waiting on a link inside it being
         visible is the reliable signal - the wrapper's aria-hidden attribute
         is not updated by the application. */
      await this.page.getByTestId('logout-sidebar-link').waitFor({ state: 'visible' });
    });
  }

  /** @returns {Promise<string>} the heading of the current screen */
  async getTitle() {
    return this.getText(this.pageTitle);
  }

  /** Assert the header is rendered with the expected branding. */
  async expectHeaderVisible() {
    await expect(this.appLogo).toBeVisible();
    await expect(this.appLogo).toHaveText(messages.labels.appLogo);
    await expect(this.cartLink).toBeVisible();
  }

  /**
   * Assert the cart badge reflects an expected count.
   * @param {number} expected 0 asserts the badge is not rendered at all
   */
  async expectCartCount(expected) {
    if (expected === 0) {
      await expect(this.cartBadge).toHaveCount(0);
      return;
    }
    await expect(this.cartBadge).toHaveText(String(expected));
  }
}

module.exports = HeaderComponent;
