/**
 * Single source of truth for runtime configuration.
 *
 * Every value is resolved once, here, from (in order of precedence):
 *   1. an explicit environment variable / CI secret
 *   2. the per-environment block in config/environments.js
 *   3. a safe framework default
 *
 * Tests and page objects import this module instead of touching
 * `process.env` directly, which keeps configuration testable and typo-proof.
 */

require('dotenv').config();

const { getEnvironment } = require('./environments');

/** Parse a boolean-ish env var ("true"/"1"/"yes") with a fallback. */
function bool(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

/** Parse a numeric env var with a fallback, ignoring empty strings. */
function num(value, fallback) {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

const environment = getEnvironment();
const isCI = bool(process.env.CI, false);

const config = {
  /** Resolved environment block: { name, baseURL, apiURL, retries }. */
  env: environment,
  isCI,

  app: {
    baseURL: environment.baseURL,
    apiURL: environment.apiURL,
  },

  /**
   * Test users. In CI these come from GitHub Actions secrets; locally from .env.
   * Keeping them in one place means a credential rotation is a one-line change.
   */
  users: {
    standard: {
      username: process.env.STANDARD_USER || 'standard_user',
      password: process.env.USER_PASSWORD || 'secret_sauce',
      description: 'Happy-path user with full access',
    },
    lockedOut: {
      username: process.env.LOCKED_OUT_USER || 'locked_out_user',
      password: process.env.USER_PASSWORD || 'secret_sauce',
      description: 'Account disabled by an administrator',
    },
    problem: {
      username: process.env.PROBLEM_USER || 'problem_user',
      password: process.env.USER_PASSWORD || 'secret_sauce',
      description: 'User whose account renders broken product images',
    },
    performance: {
      username: process.env.PERFORMANCE_USER || 'performance_glitch_user',
      password: process.env.USER_PASSWORD || 'secret_sauce',
      description: 'User with an artificially slow backend response',
    },
    invalid: {
      username: process.env.INVALID_USER || 'not_a_real_user',
      password: process.env.INVALID_PASSWORD || 'wrong_password_123',
      description: 'Unregistered credentials for negative testing',
    },
  },

  execution: {
    headless: bool(process.env.HEADLESS, true),
    workers: process.env.WORKERS ? num(process.env.WORKERS, undefined) : undefined,
    retries: num(process.env.RETRIES, isCI ? environment.retries : 0),
    slowMo: num(process.env.SLOW_MO, 0),
    browser: process.env.BROWSER || 'chromium',
  },

  timeouts: {
    test: num(process.env.TEST_TIMEOUT, 60_000),
    expect: num(process.env.EXPECT_TIMEOUT, 10_000),
    action: num(process.env.ACTION_TIMEOUT, 15_000),
    navigation: num(process.env.NAVIGATION_TIMEOUT, 30_000),
  },

  artefacts: {
    screenshot: process.env.SCREENSHOT_MODE || 'only-on-failure',
    video: process.env.VIDEO_MODE || 'retain-on-failure',
    trace: process.env.TRACE_MODE || 'retain-on-failure',
  },

  reporting: {
    allureResultsDir: process.env.ALLURE_RESULTS_DIR || 'allure-results',
    executor: process.env.ALLURE_EXECUTOR || (isCI ? 'GitHub Actions' : 'local'),
  },
};

module.exports = config;
