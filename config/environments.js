/**
 * Per-environment configuration.
 *
 * The active environment is selected with the TEST_ENV variable
 * (see .env / .env.example). Anything defined here can still be overridden
 * by an explicit environment variable, which is what makes the same suite
 * runnable locally and in CI without code changes.
 */

const environments = {
  dev: {
    name: 'dev',
    baseURL: 'https://www.saucedemo.com',
    apiURL: 'https://www.saucedemo.com/api',
    retries: 0,
  },
  qa: {
    name: 'qa',
    baseURL: 'https://www.saucedemo.com',
    apiURL: 'https://www.saucedemo.com/api',
    retries: 1,
  },
  staging: {
    name: 'staging',
    baseURL: 'https://www.saucedemo.com',
    apiURL: 'https://www.saucedemo.com/api',
    retries: 1,
  },
  prod: {
    name: 'prod',
    baseURL: 'https://www.saucedemo.com',
    apiURL: 'https://www.saucedemo.com/api',
    retries: 2,
  },
};

/**
 * @returns {{name: string, baseURL: string, apiURL: string, retries: number}}
 */
function getEnvironment() {
  const key = (process.env.TEST_ENV || 'qa').toLowerCase();
  const environment = environments[key];

  if (!environment) {
    throw new Error(
      `Unknown TEST_ENV "${key}". Expected one of: ${Object.keys(environments).join(', ')}`
    );
  }

  return {
    ...environment,
    baseURL: process.env.BASE_URL || environment.baseURL,
    apiURL: process.env.API_URL || environment.apiURL,
  };
}

module.exports = { environments, getEnvironment };
