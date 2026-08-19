/**
 * Product catalogue reference data.
 *
 * The application under test ships a fixed six-item catalogue, so these are
 * treated as known constants. `id` is the slug the application uses inside its
 * `data-test` attributes, which is what the page objects build locators from.
 */

const PRODUCTS = {
  BACKPACK: {
    id: 'sauce-labs-backpack',
    name: 'Sauce Labs Backpack',
    price: 29.99,
  },
  BIKE_LIGHT: {
    id: 'sauce-labs-bike-light',
    name: 'Sauce Labs Bike Light',
    price: 9.99,
  },
  BOLT_TSHIRT: {
    id: 'sauce-labs-bolt-t-shirt',
    name: 'Sauce Labs Bolt T-Shirt',
    price: 15.99,
  },
  FLEECE_JACKET: {
    id: 'sauce-labs-fleece-jacket',
    name: 'Sauce Labs Fleece Jacket',
    price: 49.99,
  },
  ONESIE: {
    id: 'sauce-labs-onesie',
    name: 'Sauce Labs Onesie',
    price: 7.99,
  },
  RED_TSHIRT: {
    id: 'test.allthethings()-t-shirt-(red)',
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
  },
};

/** Total number of items the catalogue is expected to display. */
const EXPECTED_PRODUCT_COUNT = Object.keys(PRODUCTS).length;

/** Sales-tax rate the application applies at checkout (8%). */
const TAX_RATE = 0.08;

/** Sort options exposed by the catalogue dropdown. */
const SORT_OPTIONS = {
  NAME_A_TO_Z: { value: 'az', label: 'Name (A to Z)' },
  NAME_Z_TO_A: { value: 'za', label: 'Name (Z to A)' },
  PRICE_LOW_TO_HIGH: { value: 'lohi', label: 'Price (low to high)' },
  PRICE_HIGH_TO_LOW: { value: 'hilo', label: 'Price (high to low)' },
};

module.exports = {
  PRODUCTS,
  EXPECTED_PRODUCT_COUNT,
  TAX_RATE,
  SORT_OPTIONS,
  /** Convenience list form, useful for data-driven `for...of` loops. */
  PRODUCT_LIST: Object.values(PRODUCTS),
};
