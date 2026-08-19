const { allure } = require('allure-playwright');

/**
 * Declarative Allure metadata.
 *
 * Instead of six `allure.*` calls at the top of every test, a spec writes:
 *
 *   await annotate({
 *     epic: EPICS.CHECKOUT,
 *     feature: 'Order placement',
 *     story: 'A shopper can complete an order',
 *     severity: SEVERITY.BLOCKER,
 *     tags: ['smoke', 'e2e'],
 *     description: 'Covers the full cart-to-confirmation path.',
 *     testCaseId: 'TC-014',
 *   });
 *
 * The payoff is a report whose Behaviours tab groups tests by business area
 * (Epic → Feature → Story) rather than by file path, which is what makes an
 * Allure report readable by someone who has never seen the code.
 */

/** Allure's fixed severity vocabulary. */
const SEVERITY = {
  BLOCKER: 'blocker',
  CRITICAL: 'critical',
  NORMAL: 'normal',
  MINOR: 'minor',
  TRIVIAL: 'trivial',
};

/** Top-level business areas, used as Allure epics. */
const EPICS = {
  AUTHENTICATION: 'Authentication',
  CATALOGUE: 'Product Catalogue',
  CART: 'Shopping Cart',
  CHECKOUT: 'Checkout',
  NAVIGATION: 'Navigation & Session',
};

/**
 * Attach metadata to the currently running test.
 *
 * @param {object} meta
 * @param {string} [meta.epic]        business area (Behaviours tab, level 1)
 * @param {string} [meta.feature]     capability under test (level 2)
 * @param {string} [meta.story]       the user-facing behaviour (level 3)
 * @param {string} [meta.severity]    one of SEVERITY
 * @param {string} [meta.description] free-text intent, shown on the test page
 * @param {string} [meta.owner]       who maintains this test
 * @param {string} [meta.testCaseId]  external test-management id
 * @param {string} [meta.issue]       linked defect id
 * @param {string[]} [meta.tags]      free-form labels, filterable in the report.
 *   Do NOT repeat a tag that already appears in the test title (`@smoke`,
 *   `@e2e`) or the describe block (`@regression`): allure-playwright extracts
 *   those automatically, and listing them here duplicates them in the report.
 * @param {Record<string, string>} [meta.parameters] data-driven case parameters
 */
async function annotate(meta = {}) {
  const {
    epic,
    feature,
    story,
    severity,
    description,
    owner,
    testCaseId,
    issue,
    tags = [],
    parameters = {},
  } = meta;

  if (epic) await allure.epic(epic);
  if (feature) await allure.feature(feature);
  if (story) await allure.story(story);
  if (severity) await allure.severity(severity);
  if (description) await allure.description(description);
  if (owner) await allure.owner(owner);
  if (testCaseId) await allure.testCaseId(testCaseId);
  if (issue) await allure.issue(issue, issue);

  for (const tag of tags) {
    await allure.tag(tag);
  }

  for (const [name, value] of Object.entries(parameters)) {
    await allure.parameter(name, String(value));
  }
}

module.exports = { annotate, SEVERITY, EPICS };
