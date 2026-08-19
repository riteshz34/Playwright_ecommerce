const { test, expect } = require('../../src/fixtures/pages.fixture');
const { annotate, SEVERITY, EPICS } = require('../../src/utils/allure-metadata');
const { PRODUCTS } = require('../../src/data/products');

/**
 * Navigation and session suite — TC-025 … TC-028
 *
 * Covers the side menu, logout, reset-app-state and the "problem user" visual
 * defect, which is a genuine data-driven UI bug the application ships on purpose.
 */
test.describe('Navigation and session @regression', () => {
  test('TC-025 | the side menu exposes all navigation options', async ({
    loggedInInventoryPage: inventory,
  }) => {
    await annotate({
      epic: EPICS.NAVIGATION,
      feature: 'Side menu',
      story: 'A shopper can open the navigation drawer',
      severity: SEVERITY.NORMAL,
      testCaseId: 'TC-025',
      tags: ['navigation'],
      description:
        'Opens the drawer, asserts all four entries are present and in order, then ' +
        'closes it again - covering the open/close lifecycle, not just the contents.',
    });

    await inventory.header.openMenu();

    await inventory.sideMenu.expectMenuOpen();
    expect(await inventory.sideMenu.getMenuItemLabels()).toEqual([
      'All Items',
      'About',
      'Logout',
      'Reset App State',
    ]);

    await inventory.sideMenu.close();
    await expect(inventory.sideMenu.logoutLink).toBeHidden();
  });

  test('TC-026 | logging out returns to the login screen and ends the session @smoke', async ({
    loggedInInventoryPage: inventory,
    loginPage,
    page,
  }) => {
    await annotate({
      epic: EPICS.NAVIGATION,
      feature: 'Session',
      story: 'Logging out terminates the session',
      severity: SEVERITY.BLOCKER,
      testCaseId: 'TC-026',
      tags: ['security', 'session'],
      description:
        'Goes beyond checking the redirect: after logging out it attempts to ' +
        'deep-link back into the catalogue and asserts the application refuses. ' +
        'A logout that leaves the session usable is a security defect.',
    });

    await inventory.header.openMenu();
    await inventory.sideMenu.clickLogout();

    await loginPage.expectLoaded();
    await expect(page).not.toHaveURL(/inventory\.html/);

    await page.goto('/inventory.html');
    await loginPage.expectLoginError(
      "Epic sadface: You can only access '/inventory.html' when you are logged in."
    );
  });

  test('TC-027 | "Reset App State" clears the cart', async ({
    loggedInInventoryPage: inventory,
    cartPage,
  }) => {
    await annotate({
      epic: EPICS.NAVIGATION,
      feature: 'Side menu',
      story: 'A shopper can reset the application state',
      severity: SEVERITY.NORMAL,
      testCaseId: 'TC-027',
      tags: ['state'],
      description:
        'Loads the cart, resets state from the drawer, and asserts the badge and ' +
        'the cart screen both report empty.',
    });

    await inventory.addProductsToCart([PRODUCTS.BACKPACK, PRODUCTS.BIKE_LIGHT]);
    await inventory.header.expectCartCount(2);

    await inventory.header.openMenu();
    await inventory.sideMenu.clickResetAppState();
    await inventory.sideMenu.close();

    await inventory.header.expectCartCount(0);

    await inventory.header.openCart();
    await cartPage.expectEmpty();
  });

  test('TC-028 | "All Items" navigates back to the catalogue from the cart', async ({
    loggedInInventoryPage: inventory,
    cartPage,
  }) => {
    await annotate({
      epic: EPICS.NAVIGATION,
      feature: 'Side menu',
      story: 'A shopper can reach the catalogue from anywhere',
      severity: SEVERITY.MINOR,
      testCaseId: 'TC-028',
      tags: ['navigation'],
      description:
        'Confirms the drawer works as a global navigation aid, not only on the catalogue.',
    });

    await inventory.addProductToCart(PRODUCTS.ONESIE);
    await inventory.header.openCart();
    await cartPage.expectLoaded();

    await cartPage.header.openMenu();
    await cartPage.sideMenu.clickAllItems();

    await inventory.expectLoaded();
    await inventory.header.expectCartCount(1);
  });

  test('TC-029 | the problem user exposes a known product-image defect', async ({
    loginPage,
    inventoryPage,
  }) => {
    await annotate({
      epic: EPICS.NAVIGATION,
      feature: 'Known defects',
      story: 'The problem_user account renders identical images for every product',
      severity: SEVERITY.CRITICAL,
      testCaseId: 'TC-029',
      issue: 'DEMO-1042',
      tags: ['visual', 'known-defect', 'negative'],
      description:
        'The application intentionally ships a defect for this account: all six ' +
        'product images resolve to the same asset. This test documents the bug ' +
        'rather than hiding it, and demonstrates how the framework asserts on ' +
        'rendered asset URLs. If the defect is ever fixed, this test fails loudly ' +
        'and prompts an update - which is the correct behaviour for a documented bug.',
    });

    await loginPage.open();
    await loginPage.loginAs('problem');
    await inventoryPage.expectLoaded();

    const imageSources = await inventoryPage.getProductImageSources();
    const distinctSources = new Set(imageSources);

    expect(imageSources, 'every product should render an image').toHaveLength(6);
    expect(
      distinctSources.size,
      `known defect DEMO-1042: expected all images to be identical for problem_user, ` +
        `found ${distinctSources.size} distinct sources`
    ).toBe(1);

    await inventoryPage.attachScreenshot('problem_user broken product images');
  });

  test('TC-030 | a slow backend user still completes login within the timeout', async ({
    loginPage,
    inventoryPage,
  }) => {
    await annotate({
      epic: EPICS.NAVIGATION,
      feature: 'Performance',
      story: 'A degraded backend does not break the sign-in journey',
      severity: SEVERITY.NORMAL,
      testCaseId: 'TC-030',
      tags: ['performance', 'resilience'],
      description:
        'Signs in as performance_glitch_user, whose backend responds with an ' +
        'artificial delay, and asserts the catalogue still loads. Also records the ' +
        'measured duration as an Allure parameter, giving the report a soft ' +
        'performance signal without turning a slow build into a false failure.',
    });

    /* This account is deliberately slow; give it room beyond the default. */
    test.slow();

    await loginPage.open();

    const startedAt = Date.now();
    await loginPage.loginAs('performance');
    await inventoryPage.expectLoaded();
    const elapsedMs = Date.now() - startedAt;

    await test.info().attach('login-duration-ms', {
      body: String(elapsedMs),
      contentType: 'text/plain',
    });

    await inventoryPage.expectProductCount(6);
    expect(elapsedMs, 'sign-in should still complete inside the configured timeout').toBeLessThan(
      30_000
    );
  });
});
