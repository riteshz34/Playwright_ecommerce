const { expect } = require('@playwright/test');
const BasePage = require('../BasePage');

/**
 * SideMenuComponent — the slide-out navigation drawer.
 *
 * Opening the drawer is the HeaderComponent's job (it owns the burger button);
 * this component owns everything *inside* the drawer. Each action waits for the
 * drawer to be interactive first, so callers never have to think about the
 * CSS slide-in animation.
 */
class SideMenuComponent extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.aboutLink = page.getByTestId('about-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');
    this.closeButton = page.locator('#react-burger-cross-btn');
    this.menuItems = page.locator('.bm-item');
  }

  /** @returns {Promise<string[]>} the visible menu entry labels, in order */
  async getMenuItemLabels() {
    return this.getAllTexts(this.menuItems);
  }

  /** Navigate back to the product catalogue. */
  async clickAllItems() {
    await this.click(this.allItemsLink, '"All Items" in the side menu');
  }

  /** Follow the external "About" link (leaves the application). */
  async clickAbout() {
    await this.click(this.aboutLink, '"About" in the side menu');
  }

  /** Log the current user out, returning to the login screen. */
  async clickLogout() {
    await this.click(this.logoutLink, '"Logout" in the side menu');
  }

  /**
   * Clear the application's client-side state (empties the cart).
   * The drawer stays open afterwards, matching the application's behaviour.
   */
  async clickResetAppState() {
    await this.click(this.resetAppStateLink, '"Reset App State" in the side menu');
  }

  /** Close the drawer and wait for it to become non-interactive. */
  async close() {
    await this.step('Close the side menu', async () => {
      await this.closeButton.click();
      await this.logoutLink.waitFor({ state: 'hidden' });
    });
  }

  /** Assert all four navigation entries are available. */
  async expectMenuOpen() {
    await expect(this.allItemsLink).toBeVisible();
    await expect(this.aboutLink).toBeVisible();
    await expect(this.logoutLink).toBeVisible();
    await expect(this.resetAppStateLink).toBeVisible();
  }
}

module.exports = SideMenuComponent;
