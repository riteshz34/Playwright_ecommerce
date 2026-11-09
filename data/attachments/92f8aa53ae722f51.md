# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation/session.spec.js >> Navigation and session @regression >> TC-025 | the side menu exposes all navigation options
- Location: tests/navigation/session.spec.js:12:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 0
+ Received  + 1

  Array [
    "All Items",
+   "Dynamic Catalog",
    "About",
    "Logout",
    "Reset App State",
  ]
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e6]:
        - generic:
          - generic:
            - generic [ref=e7]:
              - button "Open Menu" [ref=e8] [cursor=pointer]
              - img "Open Menu" [ref=e9]
            - generic [ref=e10]:
              - navigation [ref=e12]:
                - button "All Items" [active] [ref=e13] [cursor=pointer]
                - button "Dynamic Catalog" [ref=e14] [cursor=pointer]
                - link "About" [ref=e16] [cursor=pointer]:
                  - /url: https://saucelabs.com/
                - button "Logout" [ref=e17] [cursor=pointer]
                - button "Reset App State" [ref=e18] [cursor=pointer]
              - generic [ref=e19]:
                - button "Close Menu" [ref=e20] [cursor=pointer]
                - img "Close Menu" [ref=e21]
        - generic [ref=e22]: Swag Labs
        - button "Cart, empty" [ref=e25]
      - generic [ref=e26]:
        - generic [ref=e27]: Products
        - generic [ref=e29] [cursor=pointer]:
          - generic [ref=e30]: Name (A to Z)
          - combobox "Sort products" [ref=e31]:
            - option "Name (A to Z)" [selected]
            - option "Name (Z to A)"
            - option "Price (low to high)"
            - option "Price (high to low)"
    - main [ref=e32]:
      - generic [ref=e35]:
        - generic [ref=e36]:
          - button "View details for Sauce Labs Backpack" [ref=e38] [cursor=pointer]:
            - img "Sauce Labs Backpack" [ref=e39]
          - generic [ref=e40]:
            - generic [ref=e41]:
              - button "View details for Sauce Labs Backpack" [ref=e42] [cursor=pointer]:
                - generic [ref=e43]: Sauce Labs Backpack
              - generic [ref=e44]: carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.
            - generic [ref=e45]:
              - generic [ref=e46]: $29.99
              - button "Add to cart" [ref=e47] [cursor=pointer]
        - generic [ref=e48]:
          - button "View details for Sauce Labs Bike Light" [ref=e50] [cursor=pointer]:
            - img "Sauce Labs Bike Light" [ref=e51]
          - generic [ref=e52]:
            - generic [ref=e53]:
              - button "View details for Sauce Labs Bike Light" [ref=e54] [cursor=pointer]:
                - generic [ref=e55]: Sauce Labs Bike Light
              - generic [ref=e56]: A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.
            - generic [ref=e57]:
              - generic [ref=e58]: $9.99
              - button "Add to cart" [ref=e59] [cursor=pointer]
        - generic [ref=e60]:
          - button "View details for Sauce Labs Bolt T-Shirt" [ref=e62] [cursor=pointer]:
            - img "Sauce Labs Bolt T-Shirt" [ref=e63]
          - generic [ref=e64]:
            - generic [ref=e65]:
              - button "View details for Sauce Labs Bolt T-Shirt" [ref=e66] [cursor=pointer]:
                - generic [ref=e67]: Sauce Labs Bolt T-Shirt
              - generic [ref=e68]: Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.
            - generic [ref=e69]:
              - generic [ref=e70]: $15.99
              - button "Add to cart" [ref=e71] [cursor=pointer]
        - generic [ref=e72]:
          - button "View details for Sauce Labs Fleece Jacket" [ref=e74] [cursor=pointer]:
            - img "Sauce Labs Fleece Jacket" [ref=e75]
          - generic [ref=e76]:
            - generic [ref=e77]:
              - button "View details for Sauce Labs Fleece Jacket" [ref=e78] [cursor=pointer]:
                - generic [ref=e79]: Sauce Labs Fleece Jacket
              - generic [ref=e80]: It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office.
            - generic [ref=e81]:
              - generic [ref=e82]: $49.99
              - button "Add to cart" [ref=e83] [cursor=pointer]
        - generic [ref=e84]:
          - button "View details for Sauce Labs Onesie" [ref=e86] [cursor=pointer]:
            - img "Sauce Labs Onesie" [ref=e87]
          - generic [ref=e88]:
            - generic [ref=e89]:
              - button "View details for Sauce Labs Onesie" [ref=e90] [cursor=pointer]:
                - generic [ref=e91]: Sauce Labs Onesie
              - generic [ref=e92]: Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won't unravel.
            - generic [ref=e93]:
              - generic [ref=e94]: $7.99
              - button "Add to cart" [ref=e95] [cursor=pointer]
        - generic [ref=e96]:
          - button "View details for Test.allTheThings() T-Shirt (Red)" [ref=e98] [cursor=pointer]:
            - img "Test.allTheThings() T-Shirt (Red)" [ref=e99]
          - generic [ref=e100]:
            - generic [ref=e101]:
              - button "View details for Test.allTheThings() T-Shirt (Red)" [ref=e102] [cursor=pointer]:
                - generic [ref=e103]: Test.allTheThings() T-Shirt (Red)
              - generic [ref=e104]: This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard to automate a few tests. Super-soft and comfy ringspun combed cotton.
            - generic [ref=e105]:
              - generic [ref=e106]: $15.99
              - button "Add to cart" [ref=e107] [cursor=pointer]
  - contentinfo [ref=e108]:
    - list [ref=e109]:
      - listitem [ref=e110]:
        - link "X" [ref=e111] [cursor=pointer]:
          - /url: https://x.com/saucelabs
      - listitem [ref=e112]:
        - link "Facebook" [ref=e113] [cursor=pointer]:
          - /url: https://www.facebook.com/saucelabs
      - listitem [ref=e114]:
        - link "LinkedIn" [ref=e115] [cursor=pointer]:
          - /url: https://www.linkedin.com/company/sauce-labs/
    - generic [ref=e116]: © 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy
```

# Test source

```ts
  1   | const { test, expect } = require('../../src/fixtures/pages.fixture');
  2   | const { annotate, SEVERITY, EPICS } = require('../../src/utils/allure-metadata');
  3   | const { PRODUCTS } = require('../../src/data/products');
  4   | 
  5   | /**
  6   |  * Navigation and session suite — TC-025 … TC-028
  7   |  *
  8   |  * Covers the side menu, logout, reset-app-state and the "problem user" visual
  9   |  * defect, which is a genuine data-driven UI bug the application ships on purpose.
  10  |  */
  11  | test.describe('Navigation and session @regression', () => {
  12  |   test('TC-025 | the side menu exposes all navigation options', async ({
  13  |     loggedInInventoryPage: inventory,
  14  |   }) => {
  15  |     await annotate({
  16  |       epic: EPICS.NAVIGATION,
  17  |       feature: 'Side menu',
  18  |       story: 'A shopper can open the navigation drawer',
  19  |       severity: SEVERITY.NORMAL,
  20  |       testCaseId: 'TC-025',
  21  |       tags: ['navigation'],
  22  |       description:
  23  |         'Opens the drawer, asserts all four entries are present and in order, then ' +
  24  |         'closes it again - covering the open/close lifecycle, not just the contents.',
  25  |     });
  26  | 
  27  |     await inventory.header.openMenu();
  28  | 
  29  |     await inventory.sideMenu.expectMenuOpen();
> 30  |     expect(await inventory.sideMenu.getMenuItemLabels()).toEqual([
      |                                                          ^ Error: expect(received).toEqual(expected) // deep equality
  31  |       'All Items',
  32  |       'About',
  33  |       'Logout',
  34  |       'Reset App State',
  35  |     ]);
  36  | 
  37  |     await inventory.sideMenu.close();
  38  |     await expect(inventory.sideMenu.logoutLink).toBeHidden();
  39  |   });
  40  | 
  41  |   test('TC-026 | logging out returns to the login screen and ends the session @smoke', async ({
  42  |     loggedInInventoryPage: inventory,
  43  |     loginPage,
  44  |     page,
  45  |   }) => {
  46  |     await annotate({
  47  |       epic: EPICS.NAVIGATION,
  48  |       feature: 'Session',
  49  |       story: 'Logging out terminates the session',
  50  |       severity: SEVERITY.BLOCKER,
  51  |       testCaseId: 'TC-026',
  52  |       tags: ['security', 'session'],
  53  |       description:
  54  |         'Goes beyond checking the redirect: after logging out it attempts to ' +
  55  |         'deep-link back into the catalogue and asserts the application refuses. ' +
  56  |         'A logout that leaves the session usable is a security defect.',
  57  |     });
  58  | 
  59  |     await inventory.header.openMenu();
  60  |     await inventory.sideMenu.clickLogout();
  61  | 
  62  |     await loginPage.expectLoaded();
  63  |     await expect(page).not.toHaveURL(/inventory\.html/);
  64  | 
  65  |     await page.goto('/inventory.html');
  66  |     await loginPage.expectLoginError(
  67  |       "Epic sadface: You can only access '/inventory.html' when you are logged in."
  68  |     );
  69  |   });
  70  | 
  71  |   test('TC-027 | "Reset App State" clears the cart', async ({
  72  |     loggedInInventoryPage: inventory,
  73  |     cartPage,
  74  |   }) => {
  75  |     await annotate({
  76  |       epic: EPICS.NAVIGATION,
  77  |       feature: 'Side menu',
  78  |       story: 'A shopper can reset the application state',
  79  |       severity: SEVERITY.NORMAL,
  80  |       testCaseId: 'TC-027',
  81  |       tags: ['state'],
  82  |       description:
  83  |         'Loads the cart, resets state from the drawer, and asserts the badge and ' +
  84  |         'the cart screen both report empty.',
  85  |     });
  86  | 
  87  |     await inventory.addProductsToCart([PRODUCTS.BACKPACK, PRODUCTS.BIKE_LIGHT]);
  88  |     await inventory.header.expectCartCount(2);
  89  | 
  90  |     await inventory.header.openMenu();
  91  |     await inventory.sideMenu.clickResetAppState();
  92  |     await inventory.sideMenu.close();
  93  | 
  94  |     await inventory.header.expectCartCount(0);
  95  | 
  96  |     await inventory.header.openCart();
  97  |     await cartPage.expectEmpty();
  98  |   });
  99  | 
  100 |   test('TC-028 | "All Items" navigates back to the catalogue from the cart', async ({
  101 |     loggedInInventoryPage: inventory,
  102 |     cartPage,
  103 |   }) => {
  104 |     await annotate({
  105 |       epic: EPICS.NAVIGATION,
  106 |       feature: 'Side menu',
  107 |       story: 'A shopper can reach the catalogue from anywhere',
  108 |       severity: SEVERITY.MINOR,
  109 |       testCaseId: 'TC-028',
  110 |       tags: ['navigation'],
  111 |       description:
  112 |         'Confirms the drawer works as a global navigation aid, not only on the catalogue.',
  113 |     });
  114 | 
  115 |     await inventory.addProductToCart(PRODUCTS.ONESIE);
  116 |     await inventory.header.openCart();
  117 |     await cartPage.expectLoaded();
  118 | 
  119 |     await cartPage.header.openMenu();
  120 |     await cartPage.sideMenu.clickAllItems();
  121 | 
  122 |     await inventory.expectLoaded();
  123 |     await inventory.header.expectCartCount(1);
  124 |   });
  125 | 
  126 |   test('TC-029 | the problem user exposes a known product-image defect', async ({
  127 |     loginPage,
  128 |     inventoryPage,
  129 |   }) => {
  130 |     await annotate({
```