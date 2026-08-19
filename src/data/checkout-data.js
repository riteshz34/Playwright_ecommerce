/**
 * Checkout form data factory.
 *
 * A factory (rather than a frozen fixture) keeps parallel workers independent:
 * each test that needs a shopper builds its own object, so no two tests can
 * mutate shared state and interfere with each other.
 */

const { randomInt } = require('../utils/helpers');

/**
 * A complete, valid set of checkout details.
 * @param {Partial<{firstName: string, lastName: string, postalCode: string}>} overrides
 * @returns {{firstName: string, lastName: string, postalCode: string}}
 */
function validShopper(overrides = {}) {
  return {
    firstName: 'Ritesh',
    lastName: 'Zingare',
    postalCode: String(randomInt(10000, 99999)),
    ...overrides,
  };
}

/**
 * Invalid permutations for negative testing, each paired with the exact error
 * message the application is expected to surface.
 */
const INVALID_CHECKOUT_CASES = [
  {
    description: 'all fields empty',
    details: { firstName: '', lastName: '', postalCode: '' },
    expectedError: 'Error: First Name is required',
  },
  {
    description: 'first name missing',
    details: { firstName: '', lastName: 'Zingare', postalCode: '411001' },
    expectedError: 'Error: First Name is required',
  },
  {
    description: 'last name missing',
    details: { firstName: 'Ritesh', lastName: '', postalCode: '411001' },
    expectedError: 'Error: Last Name is required',
  },
  {
    description: 'postal code missing',
    details: { firstName: 'Ritesh', lastName: 'Zingare', postalCode: '' },
    expectedError: 'Error: Postal Code is required',
  },
];

/** Copy the application shows once an order is placed. */
const ORDER_CONFIRMATION = {
  header: 'Thank you for your order!',
  text: 'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
};

module.exports = { validShopper, INVALID_CHECKOUT_CASES, ORDER_CONFIRMATION };
