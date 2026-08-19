/**
 * Runs once, before the first worker starts.
 *
 * Responsibilities:
 *  1. Wipe stale Allure results so a report never mixes two runs.
 *  2. Write `environment.properties` + `executor.json`, which are what populate
 *     the "Environment" and "Executor" widgets in the generated Allure report.
 *  3. Print a run banner so CI logs state exactly what was executed.
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config');
const logger = require('../utils/logger');

async function globalSetup() {
  const resultsDir = path.resolve(process.cwd(), config.reporting.allureResultsDir);

  // A fresh directory per run. In CI each shard writes to its own workspace,
  // and the shards are merged later by the Allure generate step.
  if (fs.existsSync(resultsDir)) {
    fs.rmSync(resultsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(resultsDir, { recursive: true });

  // --- Allure "Executor" widget -------------------------------------------
  // The Allure reporter can populate the Environment widget itself (see the
  // `environmentInfo` option in playwright.config.js), but it has no equivalent
  // for the Executor widget - so that file is written here, by hand.
  //
  // In CI this is what makes each report link back to the exact workflow run
  // that produced it, which is the difference between a report you can act on
  // and a report you have to go hunting for context about.
  const executor = config.isCI
    ? {
        name: 'GitHub Actions',
        type: 'github',
        buildName:
          `#${process.env.GITHUB_RUN_NUMBER || '0'} ${process.env.GITHUB_WORKFLOW || ''}`.trim(),
        buildUrl: process.env.GITHUB_SERVER_URL
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
          : undefined,
        reportName: 'Playwright E-Commerce Regression',
      }
    : {
        name: 'Local',
        type: 'local',
        buildName: 'local-run',
        reportName: 'Playwright E-Commerce Regression (local)',
      };

  fs.writeFileSync(
    path.join(resultsDir, 'executor.json'),
    JSON.stringify(executor, null, 2),
    'utf-8'
  );

  logger.banner('PLAYWRIGHT E-COMMERCE SUITE', [
    `Environment : ${config.env.name}`,
    `Base URL    : ${config.app.baseURL}`,
    `Headless    : ${config.execution.headless}`,
    `Retries     : ${config.execution.retries}`,
    `Allure dir  : ${config.reporting.allureResultsDir}`,
  ]);
}

module.exports = globalSetup;
