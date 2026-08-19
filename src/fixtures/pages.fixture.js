const base = require('@playwright/test');
const config = require('../../config');
const {
  LoginPage,
  InventoryPage,
  ProductDetailsPage,
  CartPage,
  CheckoutInformationPage,
  CheckoutOverviewPage,
  CheckoutCompletePage,
} = require('../pages');

/**
 * Custom Playwright fixtures.
 *
 * Why fixtures instead of `beforeEach`?
 * -------------------------------------
 *  - **No boilerplate.** A spec declares only what it needs in its signature
 *    (`async ({ cartPage }) => ...`) and Playwright constructs it lazily. A test
 *    that never touches checkout never pays for a checkout page object.
 *  - **Parallel-safe by construction.** Every fixture is built per test, against
 *    that test's own isolated browser context. Nothing is shared between
 *    workers, which is precisely what makes `fullyParallel: true` safe here.
 *  - **Composable setup.** `loggedInInventoryPage` builds on `loginPage`, so the
 *    ~15 tests that begin authenticated declare one fixture instead of
 *    repeating a login block.
 *
 * @see https://playwright.dev/docs/test-fixtures
 */
const test = base.test.extend({
  /* ---------------------------------------------------------------------- */
  /* Page objects                                                           */
  /* ---------------------------------------------------------------------- */

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutInformationPage: async ({ page }, use) => {
    await use(new CheckoutInformationPage(page));
  },

  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },

  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  /* ---------------------------------------------------------------------- */
  /* Composite setup fixtures                                               */
  /* ---------------------------------------------------------------------- */

  /**
   * An authenticated session parked on the product catalogue.
   *
   * Resolves to the InventoryPage, so a spec can go straight to business:
   *
   *   test('...', async ({ loggedInInventoryPage: inventory }) => {
   *     await inventory.addProductToCart(PRODUCTS.BACKPACK);
   *   });
   */
  loggedInInventoryPage: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.open();
    await loginPage.loginAsStandardUser();
    await inventoryPage.expectLoaded();
    await use(inventoryPage);
  },

  /**
   * Declares which products a test wants pre-loaded into the cart.
   *
   * The value is an **object wrapping the list**, not a bare array, and that is
   * deliberate: Playwright reads an array passed to `test.use()` / `extend()` as
   * the `[value, options]` tuple form, so `cartProducts: [productA, productB]`
   * would be silently unwrapped to just `productA`. Wrapping the list in an
   * object sidesteps that ambiguity entirely.
   *
   *   test.use({ cartSetup: { products: [PRODUCTS.BACKPACK, PRODUCTS.ONESIE] } });
   */
  cartSetup: [{ products: [] }, { option: true }],

  /**
   * A cart pre-loaded per `cartSetup`, parked on the cart screen.
   *
   * Lets a spec skip the arrange phase completely and contain only the behaviour
   * it is actually asserting.
   */
  loadedCartPage: async ({ loggedInInventoryPage, cartPage, cartSetup }, use) => {
    const { products = [] } = cartSetup;

    if (products.length > 0) {
      await loggedInInventoryPage.addProductsToCart(products);
      await loggedInInventoryPage.header.expectCartCount(products.length);
    }

    await loggedInInventoryPage.header.openCart();
    await cartPage.expectLoaded();
    await use(cartPage);
  },

  /* ---------------------------------------------------------------------- */
  /* Auto fixtures                                                          */
  /* ---------------------------------------------------------------------- */

  /**
   * Runs automatically around every test.
   *
   * Before: nothing (kept cheap on purpose).
   * After:  on failure, attaches the final page HTML and URL to the report, so a
   *         CI failure can often be diagnosed without downloading the trace.
   */
  reportOnFailure: [
    async ({ page }, use, testInfo) => {
      await use();

      if (testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach('final-url', { body: page.url(), contentType: 'text/plain' });
        await testInfo
          .attach('final-dom', { body: await page.content(), contentType: 'text/html' })
          .catch(() => {
            /* The page may already be closed; a missing attachment must never
               mask the real assertion failure. */
          });
      }
    },
    { auto: true },
  ],
});

module.exports = {
  test,
  expect: base.expect,
  config,
};
