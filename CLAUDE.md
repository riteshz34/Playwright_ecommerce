# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

A Playwright + JavaScript UI automation framework for an e-commerce application
(`https://www.saucedemo.com`), built on the **Page Object Model**. 30 test cases
run across 5 browser projects (185 executions), reported through Allure, and
gated in GitHub Actions.

## Commands

```bash
npm test                     # full suite, all projects
npm run test:chromium        # one browser
npm run test:smoke           # @smoke tagged tests only
npm run test:headed          # watch it run
npm run test:ui              # Playwright UI mode (best for debugging)
npm run allure:report        # generate + open the Allure report
npm run lint                 # ESLint (must pass - CI gates on it)
npm run format               # Prettier
```

Run a single test by its ID: `npx playwright test --grep "TC-020"`.

## Architecture

```
config/         Runtime configuration. Everything resolves through config/index.js.
src/pages/      Page objects. BasePage is abstract; components/ holds shared UI regions.
src/fixtures/   Custom Playwright fixtures that inject page objects into tests.
src/data/       Test data and expected copy. No literals in specs.
src/utils/      Pure helpers, logger, Allure metadata.
src/hooks/      globalSetup / globalTeardown.
tests/          Specs, grouped by business area.
```

## Conventions that must be preserved

**Never put a selector in a spec file.** Locators belong in page objects only. A
spec that contains `page.locator(...)` is a defect in this framework.

**Never put a literal expected string in a spec.** Expected copy lives in
`src/data/messages.js`; product data in `src/data/products.js`.

**Locate by test id.** `playwright.config.js` sets `testIdAttribute: 'data-test'`,
so use `page.getByTestId('checkout')`, not `page.locator('[data-test="checkout"]')`
and never a positional CSS chain.

**Page-object assertion methods are named `expect*`.** ESLint's
`playwright/expect-expect` rule is configured to recognise that prefix, so a new
assertion helper must follow it or the linter will report the calling test as
having no assertions.

**No hard sleeps.** `page.waitForTimeout` is an ESLint error. Use web-first
assertions (`await expect(locator).toBeVisible()`), which auto-retry.

**Every test declares Allure metadata** via `annotate({ ... })` from
`src/utils/allure-metadata.js`, including a `testCaseId` (`TC-0NN`) and a
`description` explaining _why_ the test matters, not what it clicks.

**Arrays cannot be passed directly to `test.use()`.** Playwright reads an array
as its `[value, options]` tuple form and silently unwraps it. Option fixtures
that carry lists wrap them in an object — see `cartSetup` in
`src/fixtures/pages.fixture.js`.

## Adding a test

1. Pick the suite file under `tests/` matching the business area.
2. Add data to `src/data/` if new products or messages are involved.
3. Add page-object methods for any interaction not already modelled — the spec
   describes _intent_, the page object owns the _mechanics_.
4. Call `annotate()` first, with the next free `TC-0NN` id.
5. Tag it: `@smoke` for the critical path, `@regression` for everything, `@e2e`
   for full journeys.
6. Verify: `npm run lint && npx playwright test --grep "TC-0NN"`.

## Playwright MCP

`.mcp.json` configures the Playwright MCP server for this project, with
`--test-id-attribute=data-test` so that locators discovered through MCP match the
ones the framework uses.

Use MCP to **explore the live application** before writing a test — take a
snapshot, confirm the real DOM and the actual error copy — rather than guessing
selectors and iterating through failing runs. Prefer `browser_snapshot` (an
accessibility tree, cheap and text-based) over `browser_take_screenshot` when the
question is "what is on this page and what is it called".

Verify with the real runner before reporting a test as working: MCP proves the
application behaves a certain way, `npx playwright test` proves the _test_ does.

## Things worth knowing about the application under test

- The cart badge is **removed from the DOM** when empty, not set to `0`. Assert
  `toHaveCount(0)`, not `toHaveText('0')`.
- The burger menu's `data-test="open-menu"` is on an `<img>` that its parent
  `<button>` intercepts. Click `#react-burger-menu-btn`. `HeaderComponent`
  handles this.
- `.bm-menu-wrap` keeps `aria-hidden="true"` even when the drawer is open, so
  drawer state must be asserted via link visibility.
- `problem_user` renders one identical image for all six products. TC-029
  documents this deliberately as a known defect (`DEMO-1042`).
- `performance_glitch_user` has an artificial backend delay; TC-030 marks itself
  `test.slow()`.
