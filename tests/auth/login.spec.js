const { test, expect, config } = require('../../src/fixtures/pages.fixture');
const { annotate, SEVERITY, EPICS } = require('../../src/utils/allure-metadata');
const messages = require('../../src/data/messages');

/**
 * Authentication suite — TC-001 … TC-006
 *
 * Covers the login contract: who may in, who may not, and what the application
 * tells the user in each case.
 */
test.describe('Authentication @regression', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('TC-001 | a valid user can sign in and reach the catalogue @smoke', async ({
    loginPage,
    inventoryPage,
  }) => {
    await annotate({
      epic: EPICS.AUTHENTICATION,
      feature: 'Sign in',
      story: 'A registered shopper can sign in with valid credentials',
      severity: SEVERITY.BLOCKER,
      testCaseId: 'TC-001',
      tags: ['happy-path'],
      description:
        'The single most important test in the suite: if this fails, no other ' +
        'journey is reachable. Asserts both the redirect and that the catalogue rendered.',
    });

    await loginPage.expectLoaded();
    await loginPage.loginAs('standard');

    await inventoryPage.expectLoaded();
    await inventoryPage.header.expectHeaderVisible();
    await inventoryPage.header.expectCartCount(0);
  });

  test('TC-002 | a locked-out user is refused with an explanatory message', async ({
    loginPage,
  }) => {
    await annotate({
      epic: EPICS.AUTHENTICATION,
      feature: 'Sign in',
      story: 'A disabled account cannot sign in',
      severity: SEVERITY.CRITICAL,
      testCaseId: 'TC-002',
      tags: ['negative', 'security'],
      description:
        'A disabled account must be refused, and the message must say why - a ' +
        'generic failure would send the user to reset a password that is not the problem.',
    });

    await loginPage.loginAs('lockedOut');

    await loginPage.expectLoginError(messages.errors.lockedOut);
    await loginPage.expectStillOnLoginPage();
  });

  test('TC-003 | unrecognised credentials are rejected', async ({ loginPage }) => {
    await annotate({
      epic: EPICS.AUTHENTICATION,
      feature: 'Sign in',
      story: 'Credentials that match no account are rejected',
      severity: SEVERITY.CRITICAL,
      testCaseId: 'TC-003',
      tags: ['negative', 'security'],
      description:
        'Also asserts the message does not disclose whether it was the username ' +
        'or the password that was wrong, which would enable account enumeration.',
    });

    await loginPage.loginAs('invalid');

    await loginPage.expectLoginError(messages.errors.invalidCredentials);
    await loginPage.expectFieldsFlaggedAsInvalid();
    await loginPage.expectStillOnLoginPage();
  });

  /**
   * Data-driven: one test per required field. Each case is a separate entry in
   * the Allure report with its own parameters, so a failure names the exact field.
   */
  const requiredFieldCases = [
    {
      field: 'username',
      username: '',
      password: config.users.standard.password,
      expectedError: messages.errors.usernameRequired,
    },
    {
      field: 'password',
      username: config.users.standard.username,
      password: '',
      expectedError: messages.errors.passwordRequired,
    },
  ];

  for (const { field, username, password, expectedError } of requiredFieldCases) {
    test(`TC-004 | submitting without a ${field} shows a required-field error`, async ({
      loginPage,
    }) => {
      await annotate({
        epic: EPICS.AUTHENTICATION,
        feature: 'Form validation',
        story: 'Both credential fields are mandatory',
        severity: SEVERITY.NORMAL,
        testCaseId: 'TC-004',
        tags: ['negative', 'validation'],
        parameters: { 'Omitted field': field },
        description: `Submits the login form with an empty ${field} and asserts the field-specific error.`,
      });

      await loginPage.login(username, password);

      await loginPage.expectLoginError(expectedError);
      await loginPage.expectStillOnLoginPage();
    });
  }

  test('TC-005 | the error banner can be dismissed', async ({ loginPage }) => {
    await annotate({
      epic: EPICS.AUTHENTICATION,
      feature: 'Form validation',
      story: 'A shopper can dismiss a login error and retry',
      severity: SEVERITY.MINOR,
      testCaseId: 'TC-005',
      tags: ['usability'],
      description:
        'A stale error banner over a corrected form is a real usability defect, ' +
        'so the dismiss control is covered explicitly.',
    });

    await loginPage.loginAs('invalid');
    await loginPage.expectLoginError(messages.errors.invalidCredentials);

    await loginPage.closeErrorMessage();

    await loginPage.expectNoError();
  });

  test('TC-006 | an unauthenticated user cannot deep-link into the catalogue', async ({
    page,
    loginPage,
  }) => {
    await annotate({
      epic: EPICS.AUTHENTICATION,
      feature: 'Access control',
      story: 'Protected pages reject unauthenticated access',
      severity: SEVERITY.BLOCKER,
      testCaseId: 'TC-006',
      tags: ['security', 'negative'],
      description:
        'Bypasses the UI entirely and requests /inventory.html directly. The ' +
        'application must refuse and keep the user on the login screen.',
    });

    await page.goto('/inventory.html');

    await loginPage.expectLoginError(
      "Epic sadface: You can only access '/inventory.html' when you are logged in."
    );
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/?$/);
  });
});
