const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const HeaderComponent = require('./components/HeaderComponent');
const { parsePrice, toMoney, sumMoney } = require('../utils/helpers');
const { TAX_RATE } = require('../data/products');
const messages = require('../data/messages');

/**
 * CheckoutOverviewPage — checkout step two, the order summary.
 *
 * This is the page object that carries real business logic: `getTotals()` reads
 * the three money labels, and `expectTotalsAreArithmeticallyCorrect()` proves
 * subtotal + tax = total and that the subtotal actually equals the sum of the
 * line items. Putting that arithmetic in the page object rather than the spec
 * means every checkout test gets the same rigorous financial check for free.
 */
class CheckoutOverviewPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.path = '/checkout-step-two.html';

    this.header = new HeaderComponent(page);

    this.summaryItems = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.itemQuantities = page.getByTestId('item-quantity');

    this.paymentInformationLabel = page.getByTestId('payment-info-label');
    this.paymentInformationValue = page.getByTestId('payment-info-value');
    this.shippingInformationLabel = page.getByTestId('shipping-info-label');
    this.shippingInformationValue = page.getByTestId('shipping-info-value');

    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');

    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  /** Place the order. */
  async finishOrder() {
    await this.step('Place the order', async () => {
      await this.finishButton.click();
      await this.page.waitForURL(/checkout-complete\.html/);
    });
  }

  /** Abandon the order and return to the catalogue. */
  async cancel() {
    await this.step('Cancel the order', async () => {
      await this.cancelButton.click();
      await this.page.waitForURL(/inventory\.html/);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Queries                                                                */
  /* ---------------------------------------------------------------------- */

  /** @returns {Promise<number>} number of summary line items */
  async getItemCount() {
    return this.summaryItems.count();
  }

  /** @returns {Promise<string[]>} summary line-item names */
  async getItemNames() {
    return this.getAllTexts(this.itemNames);
  }

  /**
   * @returns {Promise<Array<{name: string, price: number, quantity: number}>>}
   */
  async getItems() {
    const count = await this.getItemCount();
    const items = [];

    for (let index = 0; index < count; index += 1) {
      const row = this.summaryItems.nth(index);
      items.push({
        name: await this.getText(row.getByTestId('inventory-item-name')),
        price: parsePrice(await this.getText(row.getByTestId('inventory-item-price'))),
        quantity: Number.parseInt(await this.getText(row.getByTestId('item-quantity')), 10),
      });
    }

    return items;
  }

  /**
   * The three money figures the application displays.
   * @returns {Promise<{subtotal: number, tax: number, total: number}>}
   */
  async getTotals() {
    return {
      subtotal: parsePrice(await this.getText(this.subtotalLabel)),
      tax: parsePrice(await this.getText(this.taxLabel)),
      total: parsePrice(await this.getText(this.totalLabel)),
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Assertions                                                             */
  /* ---------------------------------------------------------------------- */

  /** Assert step two has loaded with its payment and shipping blocks. */
  async expectLoaded() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.header.pageTitle).toHaveText(messages.titles.checkoutStepTwo);
    await expect(this.paymentInformationValue).toBeVisible();
    await expect(this.shippingInformationValue).toBeVisible();
    await expect(this.totalLabel).toBeVisible();
  }

  /** Assert the static payment and shipping copy. */
  async expectPaymentAndShippingInformation() {
    await expect(this.paymentInformationValue).toHaveText(messages.labels.paymentInformation);
    await expect(this.shippingInformationValue).toHaveText(messages.labels.shippingInformation);
  }

  /**
   * Assert the summary lists exactly these products.
   * @param {Array<{name: string, price: number}>} products
   */
  async expectItemsToBe(products) {
    await expect(this.summaryItems).toHaveCount(products.length);
    const actual = await this.getItems();

    for (const product of products) {
      const line = actual.find((item) => item.name === product.name);
      expect(line, `"${product.name}" should appear in the order summary`).toBeDefined();
      expect(line.price, `price of "${product.name}"`).toBe(product.price);
    }
  }

  /**
   * Prove the displayed money is internally consistent:
   *   subtotal === sum(line item price x quantity)
   *   tax      === round(subtotal x TAX_RATE, 2)
   *   total    === subtotal + tax
   *
   * @param {Array<{price: number}>} [expectedProducts] optional independent
   *   expectation for the subtotal, taken from the test's own data
   */
  async expectTotalsAreArithmeticallyCorrect(expectedProducts) {
    const totals = await this.getTotals();
    const items = await this.getItems();

    const lineItemSum = sumMoney(items.map((item) => item.price * item.quantity));
    expect(totals.subtotal, 'item total should equal the sum of the line items').toBe(lineItemSum);

    if (expectedProducts) {
      const expectedSubtotal = sumMoney(expectedProducts.map((product) => product.price));
      expect(totals.subtotal, 'item total should match the products the test added').toBe(
        expectedSubtotal
      );
    }

    const expectedTax = toMoney(totals.subtotal * TAX_RATE);
    expect(totals.tax, `tax should be ${TAX_RATE * 100}% of the item total`).toBe(expectedTax);

    expect(totals.total, 'total should equal item total plus tax').toBe(
      toMoney(totals.subtotal + totals.tax)
    );
  }
}

module.exports = CheckoutOverviewPage;
