// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const config = require('./config');

/**
 * Playwright runner configuration.
 *
 * Design notes
 * ------------
 * - Every tunable is sourced from `config/` so the same file drives local runs
 *   and CI without conditional edits.
 * - `fullyParallel` runs every *test* (not just every file) in its own worker,
 *   which is what makes the suite finish in seconds rather than minutes.
 * - Two reporters are always active: Playwright's own HTML report for quick
 *   local triage, and Allure for the rich, historical, CI-published report.
 * - In CI a `blob` reporter is added so results from parallel shards can be
 *   merged back into one report (`playwright merge-reports`).
 *
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  /* Where the spec files live. */
  testDir: './tests',

  /* Ignore helper files that are not specs. */
  testMatch: '**/*.spec.js',

  /* Run tests inside files in parallel, not just the files themselves. */
  fullyParallel: true,

  /* A stray `test.only` left in a commit must never silently skip the suite. */
  forbidOnly: config.isCI,

  /* Retry flaky tests in CI; fail fast locally so problems are obvious. */
  retries: config.execution.retries,

  /* Undefined lets Playwright use ~50% of available cores. */
  workers: config.execution.workers,

  /* Hard ceiling for a single test. */
  timeout: config.timeouts.test,

  /* Cap the whole run so a hung test cannot burn CI minutes indefinitely. */
  globalTimeout: config.isCI ? 30 * 60 * 1000 : undefined,

  /* Prepares the Allure environment/executor widgets before any test starts. */
  globalSetup: require.resolve('./src/hooks/global-setup.js'),
  globalTeardown: require.resolve('./src/hooks/global-teardown.js'),

  expect: {
    /* How long `expect(...)` auto-retries an assertion before failing. */
    timeout: config.timeouts.expect,
  },

  /* ---------------------------------------------------------------------- */
  /* Reporters                                                              */
  /* ---------------------------------------------------------------------- */
  reporter: [
    /* Concise console output; GitHub annotations when running in Actions. */
    config.isCI ? ['github'] : ['list', { printSteps: true }],

    /* Playwright's built-in HTML report - great for local trace viewing. */
    ['html', { outputFolder: 'playwright-report', open: 'never' }],

    /* Machine-readable summary, handy for dashboards or custom tooling. */
    ['json', { outputFile: 'test-results/results.json' }],

    /* JUnit XML so any CI system can render native test summaries. */
    ['junit', { outputFile: 'test-results/junit-results.xml' }],

    /* The main portfolio report: rich, historical, published to GitHub Pages. */
    [
      'allure-playwright',
      {
        resultsDir: config.reporting.allureResultsDir,
        detail: true,
        /* Use our own @allure.suite labels rather than the file path. */
        suiteTitle: false,
        /* Surface useful metadata on every test in the Allure UI. */
        environmentInfo: {
          Environment: config.env.name,
          Base_URL: config.app.baseURL,
          Node_Version: process.version,
          Platform: `${process.platform} ${process.arch}`,
          Executor: config.reporting.executor,
        },
      },
    ],

    /* Shard-mergeable raw results - only needed in CI. */
    ...(config.isCI ? [['blob', { outputDir: 'blob-report' }]] : []),
  ],

  /* ---------------------------------------------------------------------- */
  /* Shared settings for every project below                                */
  /* ---------------------------------------------------------------------- */
  use: {
    baseURL: config.app.baseURL,

    headless: config.execution.headless,

    /* Diagnostics. Traces are the single most useful CI artefact: they replay
       the whole test with DOM snapshots, network log and console output. */
    screenshot: config.artefacts.screenshot,
    video: config.artefacts.video,
    trace: config.artefacts.trace,

    actionTimeout: config.timeouts.action,
    navigationTimeout: config.timeouts.navigation,

    /* Resolve `page.getByTestId(...)` against the attribute this application
       actually uses. Every element under test exposes `data-test`, so the whole
       suite can rely on test ids instead of brittle CSS selectors. */
    testIdAttribute: 'data-test',

    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    locale: 'en-US',
    timezoneId: 'America/New_York',

    launchOptions: {
      slowMo: config.execution.slowMo,
    },
  },

  /* ---------------------------------------------------------------------- */
  /* Projects: cross-browser + responsive coverage                          */
  /* ---------------------------------------------------------------------- */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],

  /* Screenshots, videos and traces land here. */
  outputDir: 'test-results',
});
