const { test, expect } = require('../../src/fixtures/pages.fixture');
const { annotate, SEVERITY, EPICS } = require('../../src/utils/allure-metadata');
const { PRODUCTS } = require('../../src/data/products');
const { sumMoney } = require('../../src/utils/helpers');

/**
 * Shopping cart suite — TC-014 … TC-018
 *
 * Covers add, remove, badge accuracy, persistence and the empty-cart edge case.
 */
test.describe('Shopping cart @regression', () => {
  test('TC-014 | a single product can be added and appears in the cart @smoke', async ({
    loggedInInventoryPage: inventory,
    cartPage,
  }) => {
    await annotate({
      epic: EPICS.CART,
      feature: 'Add to cart',
      story: 'A shopper can add a product and see it in the cart',
      severity: SEVERITY.BLOCKER,
      testCaseId: 'TC-014',
      tags: ['happy-path'],
      description:
        'The core add-to-cart contract: the badge increments, the button toggles ' +
        'to Remove, and the cart lists the product at the right price and quantity.',
    });

    const product = PRODUCTS.BACKPACK;

    await inventory.addProductToCart(product);
    await inventory.header.expectCartCount(1);

    await inventory.header.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectItemsToBe([product]);
  });

  test('TC-015 | several products can be added and the badge counts them all', async ({
    loggedInInventoryPage: inventory,
    cartPage,
  }) => {
    await annotate({
      epic: EPICS.CART,
      feature: 'Add to cart',
      story: 'The cart accumulates multiple products',
      severity: SEVERITY.CRITICAL,
      testCaseId: 'TC-015',
      tags: ['happy-path'],
      description:
        'Adds three products, asserting the badge after each one, then verifies ' +
        'the cart contents and that the subtotal equals the sum of their prices.',
    });

    const products = [PRODUCTS.BACKPACK, PRODUCTS.BIKE_LIGHT, PRODUCTS.FLEECE_JACKET];

    for (const [index, product] of products.entries()) {
      await inventory.addProductToCart(product);
      await inventory.header.expectCartCount(index + 1);
    }

    await inventory.header.openCart();

    await cartPage.expectItemsToBe(products);
    expect(await cartPage.getCartSubtotal()).toBe(sumMoney(products.map((p) => p.price)));
  });

  /**
   * Nested describe so `test.use` scopes the pre-loaded cart to this test only.
   * `test.use` applies to its entire enclosing block, so isolating it here keeps
   * the surrounding tests starting from a genuinely empty cart.
   */
  test.describe('with a pre-loaded cart', () => {
    test.use({ cartSetup: { products: [PRODUCTS.BACKPACK, PRODUCTS.ONESIE] } });

    test('TC-016 | a product can be removed from the cart screen', async ({
      loadedCartPage: cart,
    }) => {
      await annotate({
        epic: EPICS.CART,
        feature: 'Remove from cart',
        story: 'A shopper can remove a line item from the cart',
        severity: SEVERITY.CRITICAL,
        testCaseId: 'TC-016',
        tags: ['happy-path'],
        description:
          'Uses the `cartProducts` option fixture to arrive with a pre-loaded cart, ' +
          'so the test body contains only the behaviour under test - the clearest ' +
          'demonstration in this suite of why fixtures beat beforeEach hooks.',
      });

      await cart.expectItemCount(2);

      await cart.removeItem(PRODUCTS.BACKPACK);

      await cart.expectItemsToBe([PRODUCTS.ONESIE]);
      await cart.header.expectCartCount(1);
    });
  });

  test('TC-017 | removing every product empties the cart and clears the badge', async ({
    loggedInInventoryPage: inventory,
    cartPage,
  }) => {
    await annotate({
      epic: EPICS.CART,
      feature: 'Remove from cart',
      story: 'An emptied cart shows no badge and no line items',
      severity: SEVERITY.NORMAL,
      testCaseId: 'TC-017',
      tags: ['edge-case'],
      description:
        'The badge is removed from the DOM rather than set to "0", so this asserts ' +
        'absence, not a zero value - a distinction that trips up naive assertions.',
    });

    const products = [PRODUCTS.BOLT_TSHIRT, PRODUCTS.RED_TSHIRT];
    await inventory.addProductsToCart(products);
    await inventory.header.openCart();
    await cartPage.expectItemCount(2);

    for (const product of products) {
      await cartPage.removeItem(product);
    }

    await cartPage.expectEmpty();
  });

  test('TC-018 | cart contents survive navigation away and back', async ({
    loggedInInventoryPage: inventory,
    cartPage,
  }) => {
    await annotate({
      epic: EPICS.CART,
      feature: 'Cart persistence',
      story: 'The cart is preserved while the shopper keeps browsing',
      severity: SEVERITY.CRITICAL,
      testCaseId: 'TC-018',
      tags: ['state', 'regression'],
      description:
        'Adds a product, leaves for the catalogue via "Continue Shopping", adds a ' +
        'second product, and returns - asserting nothing was lost along the way. ' +
        'Cart loss on navigation is a revenue-affecting defect.',
    });

    await inventory.addProductToCart(PRODUCTS.BACKPACK);
    await inventory.header.openCart();
    await cartPage.expectItemsToBe([PRODUCTS.BACKPACK]);

    await cartPage.continueShopping();
    await inventory.expectLoaded();
    await inventory.header.expectCartCount(1);

    await inventory.addProductToCart(PRODUCTS.BIKE_LIGHT);
    await inventory.header.openCart();

    await cartPage.expectItemsToBe([PRODUCTS.BACKPACK, PRODUCTS.BIKE_LIGHT]);
  });

  test('TC-019 | an empty cart shows no line items', async ({
    loggedInInventoryPage: inventory,
    cartPage,
  }) => {
    await annotate({
      epic: EPICS.CART,
      feature: 'Cart persistence',
      story: 'A first-time shopper sees an empty cart',
      severity: SEVERITY.MINOR,
      testCaseId: 'TC-019',
      tags: ['edge-case'],
      description: 'Baseline state check: a fresh session must start with nothing in the cart.',
    });

    await inventory.header.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectEmpty();
    await expect(cartPage.continueShoppingButton).toBeEnabled();
  });
});
