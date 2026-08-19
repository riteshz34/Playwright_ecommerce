const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const HeaderComponent = require('./components/HeaderComponent');
const SideMenuComponent = require('./components/SideMenuComponent');
const { parsePrice, sumMoney } = require('../utils/helpers');
const messages = require('../data/messages');

/**
 * CartPage — the shopping cart review screen.
 *
 * `getItems()` returns plain JavaScript objects rather than locators, so specs
 * can assert on cart contents with ordinary array logic. That keeps assertions
 * expressive ("the cart contains exactly these three products at these prices")
 * without leaking Playwright internals into the test layer.
 */
class CartPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.path = '/cart.html';

    this.header = new HeaderComponent(page);
    this.sideMenu = new SideMenuComponent(page);

    this.cartList = page.getByTestId('cart-list');
    this.cartItems = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.itemQuantities = page.getByTestId('item-quantity');
    this.quantityColumnLabel = page.getByTestId('cart-quantity-label');
    this.descriptionColumnLabel = page.getByTestId('cart-desc-label');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  /** Open the cart directly. */
  async open() {
    await this.goto(this.path);
    await this.waitForVisible(this.header.pageTitle);
  }

  /**
   * "Remove" button for a line item.
   * @param {string} productId slug from src/data/products.js
   */
  removeButton(productId) {
    return this.page.getByTestId(`remove-${productId}`);
  }

  /* ---------------------------------------------------------------------- */
  /* Actions                                                                */
  /* ---------------------------------------------------------------------- */

  /**
   * Remove a line item from the cart.
   * @param {{id: string, name: string}} product
   */
  async removeItem(product) {
    await this.step(`Remove "${product.name}" from the cart`, async () => {
      await this.removeButton(product.id).click();
      await expect(this.removeButton(product.id)).toHaveCount(0);
    });
  }

  /** Proceed to the checkout information form. */
  async proceedToCheckout() {
    await this.step('Proceed to checkout', async () => {
      await this.checkoutButton.click();
      await this.page.waitForURL(/checkout-step-one\.html/);
    });
  }

  /** Return to the catalogue to keep browsing. */
  async continueShopping() {
    await this.step('Continue shopping', async () => {
      await this.continueShoppingButton.click();
      await this.page.waitForURL(/inventory\.html/);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Queries                                                                */
  /* ---------------------------------------------------------------------- */

  /** @returns {Promise<number>} number of line items */
  async getItemCount() {
    return this.cartItems.count();
  }

  /**
   * Read the whole cart as data.
   * @returns {Promise<Array<{name: string, price: number, quantity: number}>>}
   */
  async getItems() {
    const count = await this.getItemCount();
    const items = [];

    for (let index = 0; index < count; index += 1) {
      const row = this.cartItems.nth(index);
      items.push({
        name: await this.getText(row.getByTestId('inventory-item-name')),
        price: parsePrice(await this.getText(row.getByTestId('inventory-item-price'))),
        quantity: Number.parseInt(await this.getText(row.getByTestId('item-quantity')), 10),
      });
    }

    return items;
  }

  /** @returns {Promise<string[]>} line-item names in display order */
  async getItemNames() {
    return this.getAllTexts(this.itemNames);
  }

  /**
   * @returns {Promise<number>} sum of `price * quantity` across all line items -
   *   the value the checkout overview's "Item total" is expected to match
   */
  async getCartSubtotal() {
    const items = await this.getItems();
    return sumMoney(items.map((item) => item.price * item.quantity));
  }

  /* ---------------------------------------------------------------------- */
  /* Assertions                                                             */
  /* ---------------------------------------------------------------------- */

  /** Assert the cart screen has loaded. */
  async expectLoaded() {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.header.pageTitle).toHaveText(messages.titles.cart);
    await expect(this.quantityColumnLabel).toBeVisible();
    await expect(this.descriptionColumnLabel).toBeVisible();
  }

  /**
   * Assert an exact number of line items.
   * @param {number} expected
   */
  async expectItemCount(expected) {
    await expect(this.cartItems).toHaveCount(expected);
  }

  /**
   * Assert the cart contains exactly these products, ignoring order.
   * @param {Array<{name: string, price: number}>} products
   */
  async expectItemsToBe(products) {
    await expect(this.cartItems).toHaveCount(products.length);
    const actual = await this.getItems();

    for (const product of products) {
      const line = actual.find((item) => item.name === product.name);
      expect(line, `"${product.name}" should be a line item in the cart`).toBeDefined();
      expect(line.price, `price of "${product.name}"`).toBe(product.price);
      expect(line.quantity, `quantity of "${product.name}"`).toBe(1);
    }
  }

  /** Assert the cart is empty. */
  async expectEmpty() {
    await expect(this.cartItems).toHaveCount(0);
    await this.header.expectCartCount(0);
  }
}

module.exports = CartPage;
