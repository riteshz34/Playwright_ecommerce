const playwright = require('eslint-plugin-playwright');

/**
 * ESLint flat configuration.
 *
 * The Playwright plugin is the valuable part here: it catches test-specific
 * mistakes that generic linting cannot, such as a conditional `expect`, a
 * `waitForTimeout` hard sleep, or a `test.only` left behind in a commit - the
 * exact issues that turn a suite flaky.
 */
module.exports = [
  {
    ignores: [
      'node_modules/**',
      'allure-report/**',
      'allure-results/**',
      'playwright-report/**',
      'blob-report/**',
      'all-blob-reports/**',
      'test-results/**',
    ],
  },

  /* ----------------------------------------------------------------------- */
  /* Framework source: page objects, fixtures, utilities, config             */
  /* ----------------------------------------------------------------------- */
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'multi-line'],
    },
  },

  /* ----------------------------------------------------------------------- */
  /* Specs: everything above, plus Playwright-specific rules                 */
  /* ----------------------------------------------------------------------- */
  {
    files: ['tests/**/*.spec.js'],
    plugins: { playwright },
    rules: {
      ...playwright.configs['flat/recommended'].rules,

      /* A `test.only` reaching main silently disables the rest of the suite. */
      'playwright/no-focused-test': 'error',
      /* A skipped test that nobody revisits is worse than no test at all. */
      'playwright/no-skipped-test': 'warn',
      /* Hard sleeps are the single biggest cause of flaky suites. */
      'playwright/no-wait-for-timeout': 'error',
      /* `if (x) expect(...)` can pass by never asserting anything. */
      'playwright/no-conditional-expect': 'error',
      /* Prefer web-first assertions, which auto-retry. */
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-useless-await': 'error',

      /*
       * Teach the rule about this framework's convention: assertions live inside
       * page-object methods named `expect*` (e.g. `cartPage.expectItemsToBe()`).
       * Without this, every well-encapsulated test is falsely flagged as having
       * no assertions - which would train the team to ignore the linter.
       */
      'playwright/expect-expect': [
        'error',
        {
          /* Any call whose final member is named `expect…` counts as an
             assertion, which covers `cartPage.expectItemsToBe()`,
             `inventory.header.expectCartCount()` and friends. */
          assertFunctionPatterns: ['(^|\\.)expect'],
        },
      ],
    },
  },
];
