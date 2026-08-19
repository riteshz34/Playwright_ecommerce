/**
 * Runs once, after the last worker finishes.
 *
 * Kept intentionally small: it reports where the artefacts landed so that both
 * a developer reading the terminal and a CI log reader know what to open next.
 * This is also the natural hook for test-data cleanup or API teardown calls in
 * a framework pointed at a stateful application.
 */

const config = require('../../config');
const logger = require('../utils/logger');

async function globalTeardown() {
  logger.banner('RUN COMPLETE', [
    `Allure results : ./${config.reporting.allureResultsDir}`,
    'Allure report  : npm run allure:report',
    'HTML report    : npm run report:html',
    'Traces/videos  : ./test-results',
  ]);
}

module.exports = globalTeardown;
