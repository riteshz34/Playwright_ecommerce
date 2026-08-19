const { test, expect } = require('../../src/fixtures/pages.fixture');
const { annotate, SEVERITY, EPICS } = require('../../src/utils/allure-metadata');
const { PRODUCTS } = require('../../src/data/products');
const { validShopper, INVALID_CHECKOUT_CASES } = require('../../src/data/checkout-data');

/**
 * Checkout suite — TC-020 … TC-024
 *
 * The commercially critical path. TC-020 is the full end-to-end order; the rest
 * cover validation, the money arithmetic and the two abandonment routes.
 */
test.describe('Checkout @regression', () => {
  test('TC-020 | a shopper can complete an order end to end @smoke @e2e', async ({
    loggedInInventoryPage: inventory,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await annotate({
      epic: EPICS.CHECKOUT,
      feature: 'Order placement',
      story: 'A shopper can buy products from catalogue to confirmation',
      severity: SEVERITY.BLOCKER,
      testCaseId: 'TC-020',
      tags: ['happy-path', 'critical-path'],
      description:
        'The flagship journey: sign in, add two products, check out, verify the ' +
        'order summary and totals, place the order and confirm the cart is emptied. ' +
        'Touches every page object in the framework.',
    });

    const products = [PRODUCTS.BACKPACK, PRODUCTS.BOLT_TSHIRT];
    const shopper = validShopper();

    await test.step('Add products to the cart', async () => {
      await inventory.addProductsToCart(products);
      await inventory.header.expectCartCount(products.length);
    });

    await test.step('Review the cart', async () => {
      await inventory.header.openCart();
      await cartPage.expectItemsToBe(products);
      await cartPage.proceedToCheckout();
    });

    await test.step('Provide shopper details', async () => {
      await checkoutInformationPage.expectLoaded();
      await checkoutInformationPage.submitInformation(shopper);
    });

    await test.step('Verify the order summary before paying', async () => {
      await checkoutOverviewPage.expectLoaded();
      await checkoutOverviewPage.expectItemsToBe(products);
      await checkoutOverviewPage.expectPaymentAndShippingInformation();
      await checkoutOverviewPage.expectTotalsAreArithmeticallyCorrect(products);
    });

    await test.step('Place the order and confirm', async () => {
      await checkoutOverviewPage.finishOrder();
      await checkoutCompletePage.expectLoaded();
      await checkoutCompletePage.expectOrderConfirmed();
      await checkoutCompletePage.attachScreenshot('Order confirmation');
    });
  });

  /**
   * Data-driven validation. One report entry per invalid permutation, each
   * parameterised with the omitted field and the message it must produce.
   */
  for (const { description, details, expectedError } of INVALID_CHECKOUT_CASES) {
    test(`TC-021 | checkout is blocked when ${description}`, async ({
      loggedInInventoryPage: inventory,
      cartPage,
      checkoutInformationPage,
    }) => {
      await annotate({
        epic: EPICS.CHECKOUT,
        feature: 'Form validation',
        story: 'All shopper detail fields are mandatory',
        severity: SEVERITY.CRITICAL,
        testCaseId: 'TC-021',
        tags: ['negative', 'validation', 'data-driven'],
        parameters: { Scenario: description, 'Expected error': expectedError },
        description:
          `Submits the checkout form with ${description} and asserts the shopper ` +
          'is held on step one with the field-specific error. An order must never ' +
          'be placeable without complete delivery details.',
      });

      await inventory.addProductToCart(PRODUCTS.BACKPACK);
      await inventory.header.openCart();
      await cartPage.proceedToCheckout();

      await checkoutInformationPage.fillInformation(details);
      await checkoutInformationPage.clickContinue();

      await checkoutInformationPage.expectValidationError(expectedError);
      await checkoutInformationPage.expectStillOnStepOne();
    });
  }

  test('TC-022 | the order summary totals are arithmetically correct', async ({
    loggedInInventoryPage: inventory,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    await annotate({
      epic: EPICS.CHECKOUT,
      feature: 'Order totals',
      story: 'Item total, tax and grand total are calculated correctly',
      severity: SEVERITY.BLOCKER,
      testCaseId: 'TC-022',
      tags: ['calculation', 'financial', 'critical-path'],
      description:
        'The highest-value assertion in the suite. Independently computes the ' +
        'expected subtotal from the test data, recomputes 8% tax, and proves ' +
        'total = subtotal + tax. A rounding defect here charges real customers ' +
        'the wrong amount.',
    });

    /* Four products, deliberately including two identically priced items so a
       naive de-duplicating subtotal bug would be caught. */
    const products = [
      PRODUCTS.BACKPACK,
      PRODUCTS.FLEECE_JACKET,
      PRODUCTS.BOLT_TSHIRT,
      PRODUCTS.RED_TSHIRT,
    ];

    await inventory.addProductsToCart(products);
    await inventory.header.openCart();

    const cartSubtotal = await cartPage.getCartSubtotal();

    await cartPage.proceedToCheckout();
    await checkoutInformationPage.submitInformation(validShopper());

    await checkoutOverviewPage.expectLoaded();
    await checkoutOverviewPage.expectTotalsAreArithmeticallyCorrect(products);

    const totals = await checkoutOverviewPage.getTotals();
    expect(totals.subtotal, 'the overview subtotal must match the cart subtotal').toBe(
      cartSubtotal
    );
    await checkoutOverviewPage.attachScreenshot('Order summary totals');
  });

  test('TC-023 | cancelling on the details form returns to the cart intact', async ({
    loggedInInventoryPage: inventory,
    cartPage,
    checkoutInformationPage,
  }) => {
    await annotate({
      epic: EPICS.CHECKOUT,
      feature: 'Abandonment',
      story: 'A shopper can back out of checkout without losing the cart',
      severity: SEVERITY.NORMAL,
      testCaseId: 'TC-023',
      tags: ['negative', 'state'],
      description:
        'Cancelling must be non-destructive: the shopper returns to a cart that ' +
        'still holds everything they selected.',
    });

    const products = [PRODUCTS.BACKPACK, PRODUCTS.ONESIE];
    await inventory.addProductsToCart(products);
    await inventory.header.openCart();
    await cartPage.proceedToCheckout();

    await checkoutInformationPage.cancel();

    await cartPage.expectLoaded();
    await cartPage.expectItemsToBe(products);
  });

  test('TC-024 | cancelling on the order summary returns to the catalogue with the cart intact', async ({
    loggedInInventoryPage: inventory,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    await annotate({
      epic: EPICS.CHECKOUT,
      feature: 'Abandonment',
      story: 'A shopper can abandon the final step without losing the cart',
      severity: SEVERITY.NORMAL,
      testCaseId: 'TC-024',
      tags: ['negative', 'state'],
      description:
        'Cancelling at the last step routes to the catalogue rather than the cart, ' +
        'so this asserts both the different destination and that nothing was ordered.',
    });

    const product = PRODUCTS.FLEECE_JACKET;
    await inventory.addProductToCart(product);
    await inventory.header.openCart();
    await cartPage.proceedToCheckout();
    await checkoutInformationPage.submitInformation(validShopper());
    await checkoutOverviewPage.expectLoaded();

    await checkoutOverviewPage.cancel();

    await inventory.expectLoaded();
    await inventory.header.expectCartCount(1);
  });
});
