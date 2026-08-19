/**
 * Small, pure helpers shared by page objects and specs.
 *
 * Everything here is deliberately free of Playwright imports so it can be unit
 * tested in isolation and reused from data factories.
 */

/**
 * Convert a displayed price string into a number.
 * @param {string} priceText e.g. "$29.99" or "Item total: $29.99"
 * @returns {number} 29.99
 */
function parsePrice(priceText) {
  const match = String(priceText).match(/-?\d+(\.\d+)?/);
  if (!match) {
    throw new Error(`Could not parse a price from "${priceText}"`);
  }
  return Number.parseFloat(match[0]);
}

/**
 * Round to 2 decimals to avoid floating-point noise when comparing money.
 * @param {number} value
 * @returns {number}
 */
function toMoney(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Sum an array of numbers as currency.
 * @param {number[]} values
 * @returns {number}
 */
function sumMoney(values) {
  return toMoney(values.reduce((total, value) => total + value, 0));
}

/**
 * @param {string[]} values
 * @returns {boolean} true when sorted A→Z (case-insensitive)
 */
function isSortedAscending(values) {
  const sorted = [...values].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  return JSON.stringify(values) === JSON.stringify(sorted);
}

/**
 * @param {string[]} values
 * @returns {boolean} true when sorted Z→A (case-insensitive)
 */
function isSortedDescending(values) {
  const sorted = [...values].sort((a, b) => b.localeCompare(a, 'en', { sensitivity: 'base' }));
  return JSON.stringify(values) === JSON.stringify(sorted);
}

/**
 * @param {number[]} values
 * @returns {boolean} true when numerically ascending (low → high)
 */
function isNumericAscending(values) {
  return values.every((value, index) => index === 0 || values[index - 1] <= value);
}

/**
 * @param {number[]} values
 * @returns {boolean} true when numerically descending (high → low)
 */
function isNumericDescending(values) {
  return values.every((value, index) => index === 0 || values[index - 1] >= value);
}

/**
 * Random integer in [min, max]. Used by data factories, never by assertions -
 * randomness in an assertion makes a failure impossible to reproduce.
 * @param {number} min
 * @param {number} max
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick `count` distinct members of an array.
 * @template T
 * @param {T[]} items
 * @param {number} count
 * @returns {T[]}
 */
function pickDistinct(items, count) {
  if (count > items.length) {
    throw new Error(`Cannot pick ${count} distinct items from a list of ${items.length}`);
  }
  const pool = [...items];
  const picked = [];
  while (picked.length < count) {
    picked.push(...pool.splice(randomInt(0, pool.length - 1), 1));
  }
  return picked;
}

module.exports = {
  parsePrice,
  toMoney,
  sumMoney,
  isSortedAscending,
  isSortedDescending,
  isNumericAscending,
  isNumericDescending,
  randomInt,
  pickDistinct,
};
