const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const HeaderComponent = require('./components/HeaderComponent');
const SideMenuComponent = require('./components/SideMenuComponent');
const { parsePrice } = require('../utils/helpers');
const messages = require('../data/messages');

/**
 * InventoryPage — the product catalogue (the application's landing page).
 *
 * The interesting design decision here is `productCard(id)`: rather than storing
 * six sets of locators, one per product, the page builds a scoped locator on
 * demand from the product's slug. Adding a product to the catalogue therefore
 * needs no change to this class at all - only a new entry in src/data/products.js.
 */
class InventoryPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.path = '/inventory.html';

    /* Composed UI regions. */
    this.header = new HeaderComponent(page);
    this.sideMenu = new SideMenuComponent(page);

    this.inventoryList = page.getByTestId('inventory-list');
    this.inventoryItems = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.itemDescriptions = page.getByTestId('inventory-item-desc');
    this.itemImages = page.locator('.inventory_item_img img');
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.activeSortOption = page.getByTestId('active-option');
  }

  /** Navigate directly to the catalogue (requires an authenticated session). */
  async open() {
    await this.goto(this.path);
    await this.waitForVisible(this.inventoryList);
  }

  /* ---------------------------------------------------------------------- */
  /* Scoped locators                                                        */
  /* ---------------------------------------------------------------------- */

  /**
   * Scope a locator to a single product card.
   * @param {string} productName exact product name
   * @returns {import('@playwright/test').Locator}
   */
  productCard(productName) {
    return this.inventoryItems.filter({ hasText: productName });
  }

  /**
   * "Add to cart" button for a product.
   * @param {string} productId slug from src/data/products.js
   */
  addToCartButton(productId) {
    return this.page.getByTestId(`add-to-cart-${productId}`);
  }

  /**
   * "Remove" button for a product (only rendered once it is in the cart).
   * @param {string} productId slug from src/data/products.js
   */
  removeButton(productId) {
    return this.page.getByTestId(`remove-${productId}`);
  }

  /**
   * The product-name link, which opens the details page.
   * @param {string} productName
   */
  productLink(productName) {
    return this.itemNames.filter({ hasText: productName });
  }

  /* ---------------------------------------------------------------------- */
  /* Actions                                                                */
  /* ---------------------------------------------------------------------- */

  /**
   * Add one product to the cart.
   * @param {{id: string, name: string}} product
   */
  async addProductToCart(product) {
    await this.step(`Add "${product.name}" to the cart`, async () => {
      await this.addToCartButton(product.id).click();
      /* The button flips to "Remove" - waiting for that is the app's own
         confirmation that its client-side state was updated. */
      await expect(this.removeButton(product.id)).toBeVisible();
    });
  }

  /**
   * Add several products in one step.
   * @param {Array<{id: string, name: string}>} products
   */
  async addProductsToCart(products) {
    for (const product of products) {
      await this.addProductToCart(product);
    }
  }

  /**
   * Remove a product from the cart, from the catalogue screen.
   * @param {{id: string, name: string}} product
   */
  async removeProductFromCart(product) {
    await this.step(`Remove "${product.name}" from the cart`, async () => {
      await this.removeButton(product.id).click();
      await expect(this.addToCartButton(product.id)).toBeVisible();
    });
  }

  /**
   * Change the catalogue sort order.
   * @param {{value: string, label: string}} sortOption from SORT_OPTIONS
   */
  async sortBy(sortOption) {
    await this.step(`Sort the catalogue by "${sortOption.label}"`, async () => {
      await this.sortDropdown.selectOption(sortOption.value);
      /* The dropdown's rendered label is updated after React re-renders the
         list, so this also guarantees the re-sort has been applied. */
      await expect(this.activeSortOption).toHaveText(sortOption.label);
    });
  }

  /**
   * Open a product's details page by clicking its name.
   * @param {{name: string}} product
   */
  async openProductDetails(product) {
    await this.step(`Open the details page for "${product.name}"`, async () => {
      await this.productLink(product.name).click();
      await this.page.waitForURL(/inventory-item\.html/);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Queries                                                                */
  /* ---------------------------------------------------------------------- */

  /** @returns {Promise<number>} number of product cards rendered */
  async getProductCount() {
    return this.inventoryItems.count();
  }

  /** @returns {Promise<string[]>} product names in display order */
  async getProductNames() {
    return this.getAllTexts(this.itemNames);
  }

  /** @returns {Promise<number[]>} product prices in display order */
  async getProductPrices() {
    const texts = await this.getAllTexts(this.itemPrices);
    return texts.map(parsePrice);
  }

  /** @returns {Promise<string[]>} `src` of every product image */
  async getProductImageSources() {
    return this.itemImages.evaluateAll((images) =>
      images.map((image) => image.getAttribute('src'))
    );
  }

  /**
   * @param {{name: string}} product
   * @returns {Promise<{name: string, description: string, price: number}>}
   */
  async getProductDetails(product) {
    const card = this.productCard(product.name);
    return {
      name: await this.getText(card.getByTestId('inventory-item-name')),
      description: await this.getText(card.getByTestId('inventory-item-desc')),
      price: parsePrice(await this.getText(card.getByTestId('inventory-item-price'))),
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Assertions                                                             */
  /* ---------------------------------------------------------------------- */

  /** Assert the catalogue has loaded with its expected chrome. */
  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.header.pageTitle).toHaveText(messages.titles.products);
    await expect(this.inventoryList).toBeVisible();
  }

  /**
   * Assert an exact number of products is rendered.
   * @param {number} expected
   */
  async expectProductCount(expected) {
    await expect(this.inventoryItems).toHaveCount(expected);
  }

  /**
   * Assert every card renders a name, a description, a price and an image.
   * Guards against the classic "empty product tile" regression.
   */
  async expectEveryCardIsComplete() {
    const count = await this.getProductCount();
    for (let index = 0; index < count; index += 1) {
      const card = this.inventoryItems.nth(index);
      await expect(card.getByTestId('inventory-item-name')).not.toBeEmpty();
      await expect(card.getByTestId('inventory-item-desc')).not.toBeEmpty();
      await expect(card.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(card.locator('img.inventory_item_img')).toBeVisible();
    }
  }
}

module.exports = InventoryPage;
