const { expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const config = require('../../config');

/**
 * BasePage — the root of the Page Object hierarchy.
 *
 * Why a base class at all?
 * ------------------------
 * Every concrete page needs the same handful of primitives: navigate, read a
 * title, wait for the page to settle, attach a screenshot to the report. Putting
 * them here means:
 *
 *  - a Playwright API change is fixed in one file, not twenty;
 *  - every interaction is automatically wrapped in an Allure step, so the report
 *    reads like a human-written test log without any per-test bookkeeping;
 *  - child pages stay short and describe *business* behaviour only.
 *
 * Locators are NOT defined here. Each child page owns its own locators, which
 * keeps the contract clear: BasePage provides verbs, child pages provide nouns.
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page Playwright page handle
   */
  constructor(page) {
    if (new.target === BasePage) {
      throw new TypeError('BasePage is abstract - extend it with a concrete page object.');
    }
    this.page = page;
    this.baseURL = config.app.baseURL;
  }

  /* ---------------------------------------------------------------------- */
  /* Reporting                                                              */
  /* ---------------------------------------------------------------------- */

  /**
   * Run an action inside a named Allure/Playwright step.
   *
   * This single wrapper is what turns the Allure report into a readable
   * narrative: "Log in as standard_user" instead of a wall of raw clicks.
   *
   * @template T
   * @param {string} name Human-readable step description
   * @param {() => Promise<T>} action
   * @returns {Promise<T>}
   */
  async step(name, action) {
    return allure.step(name, action);
  }

  /**
   * Attach a full-page screenshot to the Allure report.
   * @param {string} name Attachment title shown in the report
   */
  async attachScreenshot(name) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await allure.attachment(name, screenshot, 'image/png');
  }

  /* ---------------------------------------------------------------------- */
  /* Navigation                                                             */
  /* ---------------------------------------------------------------------- */

  /**
   * Navigate to a path relative to the configured baseURL.
   * @param {string} [path='/']
   */
  async goto(path = '/') {
    await this.step(`Navigate to "${path}"`, async () => {
      await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    });
  }

  /** Reload the current page and wait for the DOM to be ready. */
  async reload() {
    await this.step('Reload the page', async () => {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
    });
  }

  /** @returns {Promise<string>} the current URL */
  async getCurrentUrl() {
    return this.page.url();
  }

  /** @returns {Promise<string>} the document title */
  async getPageTitle() {
    return this.page.title();
  }

  /**
   * Assert the URL contains an expected fragment. Uses a web-first assertion so
   * it auto-retries while a client-side route transition completes.
   * @param {string} fragment
   */
  async expectUrlToContain(fragment) {
    await expect(this.page).toHaveURL(new RegExp(this.escapeRegExp(fragment)));
  }

  /* ---------------------------------------------------------------------- */
  /* Interaction primitives                                                 */
  /* ---------------------------------------------------------------------- */

  /**
   * Click an element after Playwright's built-in actionability checks.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} description Used for the step name
   */
  async click(locator, description) {
    await this.step(`Click ${description}`, async () => {
      await locator.click();
    });
  }

  /**
   * Clear a field and type a value.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} value
   * @param {string} description
   */
  async fill(locator, value, description) {
    await this.step(`Enter "${value}" into ${description}`, async () => {
      await locator.clear();
      await locator.fill(value);
    });
  }

  /**
   * Select an option in a native <select> by its value attribute.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} value
   * @param {string} description
   */
  async selectOption(locator, value, description) {
    await this.step(`Select "${value}" in ${description}`, async () => {
      await locator.selectOption(value);
    });
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<string>} trimmed visible text
   */
  async getText(locator) {
    return (await locator.innerText()).trim();
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<string[]>} trimmed text of every matching element
   */
  async getAllTexts(locator) {
    const texts = await locator.allInnerTexts();
    return texts.map((text) => text.trim());
  }

  /**
   * Non-throwing visibility probe, for assertions that expect an absence.
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout=2000]
   * @returns {Promise<boolean>}
   */
  async isVisible(locator, timeout = 2000) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Waiting                                                                */
  /* ---------------------------------------------------------------------- */

  /**
   * Wait for a locator to become visible.
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout]
   */
  async waitForVisible(locator, timeout = config.timeouts.action) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait until the browser reports no in-flight network requests.
   * Used sparingly: web-first assertions are preferred because they are faster
   * and far less flaky than a blanket network wait.
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /* ---------------------------------------------------------------------- */
  /* Internal                                                              */
  /* ---------------------------------------------------------------------- */

  /**
   * @param {string} text
   * @returns {string} regex-safe version of `text`
   */
  escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = BasePage;
