const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const HeaderComponent = require('./components/HeaderComponent');
const { parsePrice } = require('../utils/helpers');

/**
 * ProductDetailsPage — a single product's dedicated screen.
 *
 * Note that on this screen the add/remove buttons carry generic test ids
 * (`add-to-cart` / `remove`) rather than product-scoped ones, because only one
 * product is ever in scope. Encapsulating that inconsistency here is exactly
 * what a page object is for: specs stay unaware of it.
 */
class ProductDetailsPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.path = '/inventory-item.html';

    this.header = new HeaderComponent(page);

    this.productName = page.getByTestId('inventory-item-name');
    this.productDescription = page.getByTestId('inventory-item-desc');
    this.productPrice = page.getByTestId('inventory-item-price');
    this.productImage = page.locator('img.inventory_details_img');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
    this.backToProductsButton = page.getByTestId('back-to-products');
  }

  /**
   * Deep-link straight to a product by its numeric id.
   * @param {number} productId the `?id=` query parameter used by the application
   */
  async openById(productId) {
    await this.goto(`${this.path}?id=${productId}`);
    await this.waitForVisible(this.productName);
  }

  /** Add the currently displayed product to the cart. */
  async addToCart() {
    await this.step('Add the displayed product to the cart', async () => {
      await this.addToCartButton.click();
      await expect(this.removeButton).toBeVisible();
    });
  }

  /** Remove the currently displayed product from the cart. */
  async removeFromCart() {
    await this.step('Remove the displayed product from the cart', async () => {
      await this.removeButton.click();
      await expect(this.addToCartButton).toBeVisible();
    });
  }

  /** Return to the catalogue via the "Back to products" button. */
  async goBackToProducts() {
    await this.step('Return to the product catalogue', async () => {
      await this.backToProductsButton.click();
      await this.page.waitForURL(/inventory\.html/);
    });
  }

  /**
   * @returns {Promise<{name: string, description: string, price: number}>}
   *   everything the details screen states about the product
   */
  async getDetails() {
    return {
      name: await this.getText(this.productName),
      description: await this.getText(this.productDescription),
      price: parsePrice(await this.getText(this.productPrice)),
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Assertions                                                             */
  /* ---------------------------------------------------------------------- */

  /** Assert the details screen has rendered. */
  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory-item\.html/);
    await expect(this.productName).toBeVisible();
    await expect(this.productImage).toBeVisible();
  }

  /**
   * Assert the screen shows exactly the expected product.
   * @param {{name: string, price: number}} product
   */
  async expectProduct(product) {
    await expect(this.productName).toHaveText(product.name);
    await expect(this.productPrice).toHaveText(`$${product.price.toFixed(2)}`);
    await expect(this.productDescription).not.toBeEmpty();
  }
}

module.exports = ProductDetailsPage;
