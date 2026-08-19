const { test, expect } = require('../../src/fixtures/pages.fixture');
const { annotate, SEVERITY, EPICS } = require('../../src/utils/allure-metadata');
const { SORT_OPTIONS, EXPECTED_PRODUCT_COUNT } = require('../../src/data/products');
const {
  isSortedAscending,
  isSortedDescending,
  isNumericAscending,
  isNumericDescending,
} = require('../../src/utils/helpers');

/**
 * Catalogue sorting suite — TC-012 … TC-013
 *
 * A data-driven table drives all four sort orders through one test body. Each
 * case appears separately in the Allure report with its own parameters, so a
 * failure identifies the exact sort order without reading the code.
 */
test.describe('Catalogue sorting @regression', () => {
  const sortCases = [
    {
      option: SORT_OPTIONS.NAME_A_TO_Z,
      dimension: 'name',
      read: (inventory) => inventory.getProductNames(),
      isOrdered: isSortedAscending,
    },
    {
      option: SORT_OPTIONS.NAME_Z_TO_A,
      dimension: 'name',
      read: (inventory) => inventory.getProductNames(),
      isOrdered: isSortedDescending,
    },
    {
      option: SORT_OPTIONS.PRICE_LOW_TO_HIGH,
      dimension: 'price',
      read: (inventory) => inventory.getProductPrices(),
      isOrdered: isNumericAscending,
    },
    {
      option: SORT_OPTIONS.PRICE_HIGH_TO_LOW,
      dimension: 'price',
      read: (inventory) => inventory.getProductPrices(),
      isOrdered: isNumericDescending,
    },
  ];

  for (const { option, dimension, read, isOrdered } of sortCases) {
    test(`TC-012 | the catalogue can be sorted by "${option.label}"`, async ({
      loggedInInventoryPage: inventory,
    }) => {
      await annotate({
        epic: EPICS.CATALOGUE,
        feature: 'Sorting',
        story: `Products can be ordered by ${dimension}`,
        severity: SEVERITY.NORMAL,
        testCaseId: 'TC-012',
        tags: ['sorting', 'data-driven'],
        parameters: { 'Sort option': option.label, Dimension: dimension },
        description:
          `Applies the "${option.label}" sort and verifies the resulting order ` +
          'programmatically rather than against a hard-coded list, so the test ' +
          'stays valid if the catalogue changes.',
      });

      await inventory.sortBy(option);

      const values = await read(inventory);

      expect(values, 'sorting must not add or drop products').toHaveLength(EXPECTED_PRODUCT_COUNT);
      expect(
        isOrdered(values),
        `products should be ordered by ${dimension} as "${option.label}", but got: ${JSON.stringify(values)}`
      ).toBe(true);
    });
  }

  test('TC-013 | the catalogue defaults to Name (A to Z)', async ({
    loggedInInventoryPage: inventory,
  }) => {
    await annotate({
      epic: EPICS.CATALOGUE,
      feature: 'Sorting',
      story: 'The catalogue has a predictable default order',
      severity: SEVERITY.MINOR,
      testCaseId: 'TC-013',
      tags: ['sorting'],
      description:
        'Asserts the default state, then round-trips through another sort and ' +
        'back to confirm the selection is genuinely reapplied and not merely cached.',
    });

    await expect(inventory.activeSortOption).toHaveText(SORT_OPTIONS.NAME_A_TO_Z.label);
    expect(isSortedAscending(await inventory.getProductNames())).toBe(true);

    await inventory.sortBy(SORT_OPTIONS.PRICE_HIGH_TO_LOW);
    expect(isNumericDescending(await inventory.getProductPrices())).toBe(true);

    await inventory.sortBy(SORT_OPTIONS.NAME_A_TO_Z);
    expect(isSortedAscending(await inventory.getProductNames())).toBe(true);
  });
});
