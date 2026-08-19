const { test, expect } = require('../../src/fixtures/pages.fixture');
const { annotate, SEVERITY, EPICS } = require('../../src/utils/allure-metadata');
const { PRODUCTS, EXPECTED_PRODUCT_COUNT } = require('../../src/data/products');

/**
 * Product catalogue suite — TC-007 … TC-010
 *
 * Covers what the catalogue renders and how a shopper drills into a product.
 */
test.describe('Product catalogue @regression', () => {
  test('TC-007 | the catalogue lists every product with complete details @smoke', async ({
    loggedInInventoryPage: inventory,
  }) => {
    await annotate({
      epic: EPICS.CATALOGUE,
      feature: 'Catalogue listing',
      story: 'All products are listed with name, description, price and image',
      severity: SEVERITY.BLOCKER,
      testCaseId: 'TC-007',
      tags: ['happy-path'],
      description:
        'Asserts the item count and then walks every card checking no field is ' +
        'blank and the price is correctly formatted currency. Catches the classic ' +
        '"product tile renders but the price is missing" regression.',
    });

    await inventory.expectProductCount(EXPECTED_PRODUCT_COUNT);
    await inventory.expectEveryCardIsComplete();
  });

  test('TC-008 | each product card shows the catalogue-defined name and price', async ({
    loggedInInventoryPage: inventory,
  }) => {
    await annotate({
      epic: EPICS.CATALOGUE,
      feature: 'Catalogue listing',
      story: 'Displayed product data matches the expected catalogue',
      severity: SEVERITY.CRITICAL,
      testCaseId: 'TC-008',
      tags: ['data-integrity'],
      description:
        'Compares every rendered card against the reference catalogue in ' +
        'src/data/products.js - a real price-drift check, not just a smoke test.',
    });

    for (const product of Object.values(PRODUCTS)) {
      await test.step(`Verify "${product.name}" is listed at $${product.price.toFixed(2)}`, async () => {
        const actual = await inventory.getProductDetails(product);
        expect(actual.name).toBe(product.name);
        expect(actual.price).toBe(product.price);
        expect(actual.description.length).toBeGreaterThan(10);
      });
    }
  });

  test('TC-009 | a product name opens its details page with matching data', async ({
    loggedInInventoryPage: inventory,
    productDetailsPage,
  }) => {
    await annotate({
      epic: EPICS.CATALOGUE,
      feature: 'Product details',
      story: 'A shopper can open a product and see consistent information',
      severity: SEVERITY.CRITICAL,
      testCaseId: 'TC-009',
      tags: ['happy-path'],
      description:
        'Reads the data from the catalogue card first, then asserts the details ' +
        'page reproduces it exactly. Inconsistency between list and detail views ' +
        'is a common and costly e-commerce bug.',
    });

    const product = PRODUCTS.FLEECE_JACKET;
    const fromCatalogue = await inventory.getProductDetails(product);

    await inventory.openProductDetails(product);

    await productDetailsPage.expectLoaded();
    await productDetailsPage.expectProduct(product);

    const fromDetails = await productDetailsPage.getDetails();
    expect(fromDetails, 'details page must match the catalogue card').toEqual(fromCatalogue);
  });

  test('TC-010 | "Back to products" returns to the catalogue', async ({
    loggedInInventoryPage: inventory,
    productDetailsPage,
  }) => {
    await annotate({
      epic: EPICS.CATALOGUE,
      feature: 'Product details',
      story: 'A shopper can return to the catalogue from a product page',
      severity: SEVERITY.NORMAL,
      testCaseId: 'TC-010',
      tags: ['navigation'],
      description:
        'Round-trips catalogue to details and back, confirming the full list is restored.',
    });

    await inventory.openProductDetails(PRODUCTS.BIKE_LIGHT);
    await productDetailsPage.expectLoaded();

    await productDetailsPage.goBackToProducts();

    await inventory.expectLoaded();
    await inventory.expectProductCount(EXPECTED_PRODUCT_COUNT);
  });

  test('TC-011 | a product can be added to the cart from its details page', async ({
    loggedInInventoryPage: inventory,
    productDetailsPage,
  }) => {
    await annotate({
      epic: EPICS.CATALOGUE,
      feature: 'Product details',
      story: 'A shopper can add to the cart without returning to the catalogue',
      severity: SEVERITY.CRITICAL,
      testCaseId: 'TC-011',
      tags: ['happy-path', 'cart'],
      description:
        'Also asserts the state survives navigation: after adding on the details ' +
        'page, the catalogue must show the product as already added.',
    });

    const product = PRODUCTS.ONESIE;
    await inventory.openProductDetails(product);

    await productDetailsPage.addToCart();
    await productDetailsPage.header.expectCartCount(1);

    await productDetailsPage.goBackToProducts();

    await inventory.header.expectCartCount(1);
    await expect(
      inventory.removeButton(product.id),
      'the catalogue must reflect that the product is already in the cart'
    ).toBeVisible();
  });
});
