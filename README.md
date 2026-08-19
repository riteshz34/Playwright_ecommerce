# Playwright E-Commerce Automation Framework

[![Playwright Regression](https://github.com/YOUR_USERNAME/playwright-ecommerce-pom-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/YOUR_USERNAME/playwright-ecommerce-pom-framework/actions/workflows/playwright.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.62-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Node](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Allure](https://img.shields.io/badge/Allure-Report-FF6D00)](https://allurereport.org/)
[![Claude Code](https://img.shields.io/badge/Claude_Code-MCP_integrated-D97757)](https://claude.com/claude-code)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-shaped UI test automation framework for an e-commerce application,
built with **Playwright** and **JavaScript** on the **Page Object Model**.

**30 test cases · 185 executions across 5 browser projects · full suite green in
~1.6 minutes · Allure reporting · sharded GitHub Actions pipeline · Claude Code +
Playwright MCP integration.**

Application under test: [saucedemo.com](https://www.saucedemo.com) — a public
e-commerce demo with a catalogue, cart, and multi-step checkout.

---

## Table of contents

- [Why this framework looks the way it does](#why-this-framework-looks-the-way-it-does)
- [What is covered](#what-is-covered)
- [Environment setup](#environment-setup)
- [Running the tests](#running-the-tests)
- [Project structure](#project-structure)
- [The Page Object Model, as implemented here](#the-page-object-model-as-implemented-here)
- [Fixtures: how a test gets its page objects](#fixtures-how-a-test-gets-its-page-objects)
- [Configuration and environments](#configuration-and-environments)
- [Parallel execution](#parallel-execution)
- [Allure reporting](#allure-reporting)
- [CI/CD pipeline](#cicd-pipeline)
- [Claude Code and Playwright MCP integration](#claude-code-and-playwright-mcp-integration)
- [Design decisions and trade-offs](#design-decisions-and-trade-offs)
- [Troubleshooting](#troubleshooting)

---

## Why this framework looks the way it does

Most portfolio test repos are a folder of specs with selectors inlined and a
screenshot of a passing run. This one is built the way a framework that has to
survive contact with a real team is built, and every claim below is verifiable by
running it:

| Concern                                      | How it is addressed                                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Specs rot when the UI changes**            | Zero selectors in any spec. All locators live in page objects; a redesigned checkout is a one-file change. |
| **Assertions drift from the product**        | All expected copy lives in `src/data/messages.js`.                                                         |
| **Suites get slow**                          | `fullyParallel` + CI sharding: 185 executions in ~1.6 min locally, 9 concurrent CI jobs.                   |
| **Flaky tests get papered over**             | `waitForTimeout` is an **ESLint error**. Web-first, auto-retrying assertions only.                         |
| **Reports say "12 failed" and nothing else** | Allure with behaviour grouping, per-step logs, screenshots, traces, and trend history.                     |
| **Nobody can tell what a test is for**       | Every test carries a `testCaseId`, severity, tags and a description of _why it matters_.                   |
| **Credentials end up in git**                | All configuration flows through `config/`, sourced from `.env` locally and repository secrets in CI.       |
| **Locators are guessed, then debugged**      | Playwright MCP lets Claude read the live DOM before a test is written.                                     |

---

## What is covered

30 test cases (`TC-001` … `TC-030`) across five business areas. Data-driven cases
expand to **37 executions per browser project**, or 185 across all five.

<details open>
<summary><b>Authentication</b> — 6 cases (TC-001 … TC-006)</summary>

| ID     | Test                                                                           | Tags          |
| ------ | ------------------------------------------------------------------------------ | ------------- |
| TC-001 | A valid user can sign in and reach the catalogue                               | `@smoke`      |
| TC-002 | A locked-out user is refused with an explanatory message                       | `@negative`   |
| TC-003 | Unrecognised credentials are rejected without disclosing which field was wrong | `@security`   |
| TC-004 | Required-field validation for username and password (data-driven, 2 cases)     | `@validation` |
| TC-005 | The error banner can be dismissed                                              | `@usability`  |
| TC-006 | An unauthenticated user cannot deep-link into the catalogue                    | `@security`   |

</details>

<details open>
<summary><b>Product catalogue</b> — 7 cases (TC-007 … TC-013)</summary>

| ID     | Test                                                              | Tags              |
| ------ | ----------------------------------------------------------------- | ----------------- |
| TC-007 | The catalogue lists every product with complete details           | `@smoke`          |
| TC-008 | Each card matches the reference catalogue name and price          | `@data-integrity` |
| TC-009 | A product name opens its details page with consistent data        | `@happy-path`     |
| TC-010 | "Back to products" returns to the catalogue                       | `@navigation`     |
| TC-011 | A product can be added to the cart from its details page          | `@cart`           |
| TC-012 | Sorting by name and price, both directions (data-driven, 4 cases) | `@sorting`        |
| TC-013 | The catalogue defaults to Name (A to Z) and re-sorts correctly    | `@sorting`        |

</details>

<details open>
<summary><b>Shopping cart</b> — 6 cases (TC-014 … TC-019)</summary>

| ID     | Test                                                      | Tags          |
| ------ | --------------------------------------------------------- | ------------- |
| TC-014 | A single product can be added and appears in the cart     | `@smoke`      |
| TC-015 | Several products accumulate and the badge counts them all | `@happy-path` |
| TC-016 | A product can be removed from the cart screen             | `@happy-path` |
| TC-017 | Removing everything empties the cart and clears the badge | `@edge-case`  |
| TC-018 | Cart contents survive navigation away and back            | `@state`      |
| TC-019 | A fresh session starts with an empty cart                 | `@edge-case`  |

</details>

<details open>
<summary><b>Checkout</b> — 5 cases (TC-020 … TC-024)</summary>

| ID     | Test                                                                  | Tags            |
| ------ | --------------------------------------------------------------------- | --------------- |
| TC-020 | A shopper can complete an order end to end                            | `@smoke` `@e2e` |
| TC-021 | Checkout is blocked on incomplete details (data-driven, 4 cases)      | `@validation`   |
| TC-022 | Item total, 8% tax and grand total are arithmetically correct         | `@financial`    |
| TC-023 | Cancelling on the details form returns to an intact cart              | `@state`        |
| TC-024 | Cancelling on the order summary returns to the catalogue, cart intact | `@state`        |

</details>

<details open>
<summary><b>Navigation and session</b> — 6 cases (TC-025 … TC-030)</summary>

| ID     | Test                                                              | Tags                 |
| ------ | ----------------------------------------------------------------- | -------------------- |
| TC-025 | The side menu exposes all navigation options and closes again     | `@navigation`        |
| TC-026 | Logging out ends the session and blocks re-entry by URL           | `@smoke` `@security` |
| TC-027 | "Reset App State" clears the cart                                 | `@state`             |
| TC-028 | "All Items" navigates to the catalogue from the cart              | `@navigation`        |
| TC-029 | `problem_user` exposes a known product-image defect (`DEMO-1042`) | `@known-defect`      |
| TC-030 | A slow backend still completes sign-in within the timeout         | `@performance`       |

</details>

Two cases deserve a specific note, because they show intent rather than coverage
padding:

- **TC-022** does not merely read the total off the page. It computes the expected
  subtotal independently from the test's own data, recomputes 8% tax, and proves
  `total == subtotal + tax`. It deliberately includes two identically priced
  products so a de-duplicating subtotal bug cannot hide. A rounding defect here
  charges real customers the wrong amount.
- **TC-029** asserts a bug _exists_. The application intentionally serves one
  identical image for all six products to `problem_user`. Rather than skipping
  that account, the suite documents the defect against issue `DEMO-1042` — and if
  it is ever fixed, the test fails loudly and asks to be updated.

---

## Environment setup

### Prerequisites

| Requirement | Version                   | Notes                                             |
| ----------- | ------------------------- | ------------------------------------------------- |
| **Node.js** | ≥ 18 (20 LTS recommended) | [nodejs.org](https://nodejs.org/) — `node -v`     |
| **npm**     | ≥ 9                       | Ships with Node                                   |
| **Git**     | any recent                |                                                   |
| **Java**    | ≥ 8 (JRE)                 | **Only** for the Allure CLI, which is a Java tool |

Everything else, including the browsers, is installed by npm.

### Install

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/playwright-ecommerce-pom-framework.git
cd playwright-ecommerce-pom-framework

# 2. Dependencies
npm ci                 # use `npm install` if you have no package-lock.json

# 3. Browsers (~1 GB: Chromium, Firefox, WebKit)
npx playwright install

# 4. Environment file
cp .env.example .env

# 5. Verify the setup end to end
npm run test:smoke
```

The smoke suite finishes in a few seconds. If it passes, the framework is
correctly installed.

### Configuring `.env`

`.env` is git-ignored; `.env.example` documents every supported variable and is
the file to copy. The defaults work out of the box against the public demo
application, so **no secrets are required to run this suite**.

```bash
TEST_ENV=qa                          # dev | qa | staging | prod
BASE_URL=https://www.saucedemo.com   # overrides the TEST_ENV base URL
STANDARD_USER=standard_user
USER_PASSWORD=secret_sauce
HEADLESS=true                        # false to watch the browser
WORKERS=                             # blank = 50% of CPU cores
RETRIES=1
TEST_TIMEOUT=60000
TRACE_MODE=retain-on-failure         # on | off | retain-on-failure
```

Precedence is **environment variable → `config/environments.js` → framework
default**, resolved once in `config/index.js`. That single chain is what lets the
same suite run locally, in Docker, and in CI without a conditional anywhere in
the test code.

### Installing the Allure CLI

Only needed to _view_ reports locally — the suite always writes raw Allure
results without it, and CI generates the report itself.

```bash
# macOS
brew install allure

# Windows
scoop install allure

# Any platform (via npm, bundled with this project already)
npx allure --version
```

---

## Running the tests

```bash
# Everything, all 5 projects (185 executions, ~1.6 min)
npm test

# By browser
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:mobile

# By tag
npm run test:smoke          # critical path only - fastest signal
npm run test:regression     # the full suite
npm run test:e2e            # complete user journeys

# By test case, file, or pattern
npx playwright test --grep "TC-020"
npx playwright test tests/checkout/
npx playwright test --grep "@financial"

# Debugging
npm run test:headed         # watch a real browser
npm run test:ui             # Playwright UI mode - time-travel debugging
npm run test:debug          # step through with the inspector
npx playwright test --grep "TC-022" --debug

# Concurrency
npm run test:serial         # 1 worker - useful when diagnosing a race
npm run test:parallel       # force 4 workers

# Re-run only what failed last time
npm run test:failed

# Reports
npm run report:html         # Playwright's own report (embeds traces)
npm run allure:report       # generate + open Allure
npm run allure:serve        # one-shot temporary Allure server

# Record a new test interactively
npm run codegen
```

### Reading a failure

Every failing test leaves behind, automatically:

| Artefact            | Where                               | Why it matters                                                                                                      |
| ------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Trace**           | `test-results/**/trace.zip`         | Replays the whole test: DOM snapshots per step, network log, console. Open with `npx playwright show-trace <path>`. |
| **Screenshot**      | `test-results/**/test-failed-1.png` | The moment of failure.                                                                                              |
| **Video**           | `test-results/**/video.webm`        | The run leading up to it.                                                                                           |
| **Final DOM + URL** | Attached to the report              | Captured by the `reportOnFailure` fixture, so most CI failures are diagnosable without downloading anything.        |

---

## Project structure

```
.
├── .github/workflows/
│   └── playwright.yml              # 3-stage CI: lint → 9 sharded test jobs → merged report
├── .claude/
│   └── commands/                   # Claude Code slash commands (MCP-driven)
│       ├── explore-page.md         #   /explore-page  - reconnaissance on a live page
│       ├── new-test.md             #   /new-test      - add a test, MCP-verified first
│       └── triage.md               #   /triage        - classify failures: bug vs flaky
├── .mcp.json                       # Playwright MCP server, scoped to this project
├── CLAUDE.md                       # Conventions Claude Code must follow here
│
├── config/
│   ├── environments.js             # Per-environment blocks (dev/qa/staging/prod)
│   └── index.js                    # THE config resolver - env var > env block > default
│
├── src/
│   ├── pages/
│   │   ├── BasePage.js             # Abstract root: verbs, Allure steps, waits
│   │   ├── LoginPage.js
│   │   ├── InventoryPage.js
│   │   ├── ProductDetailsPage.js
│   │   ├── CartPage.js
│   │   ├── CheckoutInformationPage.js
│   │   ├── CheckoutOverviewPage.js  # Owns the money arithmetic assertions
│   │   ├── CheckoutCompletePage.js
│   │   ├── components/
│   │   │   ├── HeaderComponent.js   # Persistent bar: logo, cart badge, burger
│   │   │   └── SideMenuComponent.js # The slide-out drawer
│   │   └── index.js                 # Barrel export
│   │
│   ├── fixtures/
│   │   └── pages.fixture.js         # Injects page objects; composite setup fixtures
│   │
│   ├── data/
│   │   ├── products.js              # Catalogue reference data, sort options, tax rate
│   │   ├── checkout-data.js         # Shopper factory + invalid permutations
│   │   └── messages.js              # Every expected string in the suite
│   │
│   ├── utils/
│   │   ├── helpers.js               # Pure functions: price parsing, sort predicates
│   │   ├── logger.js                # TTY-aware console logger
│   │   └── allure-metadata.js       # annotate(), SEVERITY, EPICS
│   │
│   └── hooks/
│       ├── global-setup.js          # Cleans results, writes the Allure executor
│       └── global-teardown.js       # Reports where the artefacts landed
│
├── tests/
│   ├── auth/login.spec.js           # TC-001 … TC-006
│   ├── products/catalogue.spec.js   # TC-007 … TC-011
│   ├── products/sorting.spec.js     # TC-012 … TC-013
│   ├── cart/cart.spec.js            # TC-014 … TC-019
│   ├── checkout/checkout.spec.js    # TC-020 … TC-024
│   └── navigation/session.spec.js   # TC-025 … TC-030
│
├── playwright.config.js             # Runner config: 5 projects, 5 reporters
├── eslint.config.js                 # Flat config + eslint-plugin-playwright
├── .env.example                     # Documented environment template
└── package.json
```

---

## The Page Object Model, as implemented here

The rule this framework enforces: **a spec describes intent, a page object owns
mechanics.** No spec contains a selector — that is checkable, and it holds.

### The layering

```
     Spec  ──── "a shopper can complete an order"
       │        (business language, assertions, test data)
       ▼
  Fixtures  ──── constructs page objects, per test, lazily
       │
       ▼
Page Objects  ──── locators + business actions + expect* assertions
       │              │
       │              └── Components (header, side menu) - composed, not inherited
       ▼
  BasePage  ──── generic verbs: goto, click, fill, waits, Allure steps
       │
       ▼
 Playwright  ──── the browser
```

### What that buys you, concretely

A spec reads as a description of behaviour:

```js
test('TC-014 | a single product can be added and appears in the cart @smoke', async ({
  loggedInInventoryPage: inventory,
  cartPage,
}) => {
  await annotate({/* epic, story, severity, testCaseId, tags, description */});

  const product = PRODUCTS.BACKPACK;

  await inventory.addProductToCart(product);
  await inventory.header.expectCartCount(1);

  await inventory.header.openCart();

  await cartPage.expectLoaded();
  await cartPage.expectItemsToBe([product]);
});
```

No URL. No selector. No literal expected string. No login boilerplate. If the
cart is redesigned tomorrow, this test does not change.

### `BasePage` — verbs, not nouns

`BasePage` is **abstract** (it throws if instantiated directly) and deliberately
defines _no locators_. It provides the primitives every page needs — `goto`,
`click`, `fill`, `waitForVisible`, `attachScreenshot` — each wrapped in an Allure
step. That wrapper is why the report reads like a human-written log:

```js
async click(locator, description) {
  await this.step(`Click ${description}`, async () => {
    await locator.click();
  });
}
```

One method, and every click in the suite is self-documenting in the report.

### Components over duplication

The header appears on all six screens. Rather than six copies of the cart-badge
locator, `HeaderComponent` owns it once and pages compose it:

```js
this.header = new HeaderComponent(page); // inventory, cart, checkout, ...
this.sideMenu = new SideMenuComponent(page);
```

Pages **inherit** generic verbs from `BasePage` and **compose** reusable UI
regions. Inheritance for behaviour, composition for structure.

### Locators built on demand, not enumerated

The catalogue has six products. Storing six sets of locators would mean editing
the page object every time the catalogue changes. Instead:

```js
addToCartButton(productId) {
  return this.page.getByTestId(`add-to-cart-${productId}`);
}
```

Adding a seventh product requires **no change to any page object** — only a new
entry in `src/data/products.js`.

### Business logic belongs in the page object

`CheckoutOverviewPage` does not just read the totals; it owns the proof that they
are correct:

```js
async expectTotalsAreArithmeticallyCorrect(expectedProducts) {
  const totals = await this.getTotals();
  const items  = await this.getItems();

  expect(totals.subtotal).toBe(sumMoney(items.map((i) => i.price * i.quantity)));
  expect(totals.tax).toBe(toMoney(totals.subtotal * TAX_RATE));
  expect(totals.total).toBe(toMoney(totals.subtotal + totals.tax));
}
```

Every checkout test inherits that rigour for free, in one line.

### Assertions live in the page object too

Methods prefixed `expect*` encapsulate assertions, so a spec states _what should
be true_ rather than _how to check it_. ESLint is configured to recognise the
prefix (via `assertFunctionPatterns`), so well-encapsulated tests are not falsely
flagged as assertion-free.

---

## Fixtures: how a test gets its page objects

Playwright fixtures replace `beforeEach` entirely. A test declares what it needs
in its signature and Playwright builds it — lazily, per test, against that test's
own isolated browser context.

```js
// A test that needs an authenticated session on the catalogue:
test('...', async ({ loggedInInventoryPage: inventory }) => { ... });

// A test that needs a cart already holding two products:
test.describe('with a pre-loaded cart', () => {
  test.use({ cartSetup: { products: [PRODUCTS.BACKPACK, PRODUCTS.ONESIE] } });

  test('TC-016 | ...', async ({ loadedCartPage: cart }) => {
    await cart.removeItem(PRODUCTS.BACKPACK);        // the test body is the behaviour
    await cart.expectItemsToBe([PRODUCTS.ONESIE]);   // and nothing else
  });
});
```

Three properties matter:

1. **No boilerplate.** ~15 tests start authenticated and none contain a login block.
2. **Lazily built.** A test that never touches checkout never constructs a
   checkout page object.
3. **Parallel-safe by construction.** Every fixture is per-test against an
   isolated context. Nothing is shared between workers — which is exactly what
   makes `fullyParallel: true` safe here rather than merely fast.

An `auto` fixture, `reportOnFailure`, attaches the final URL and DOM to the report
on any failure, so most CI failures are diagnosable from the report alone.

> **A real gotcha this framework documents:** Playwright reads an **array** passed
> to `test.use()` as its `[value, options]` tuple form and silently unwraps it. So
> `cartProducts: [productA, productB]` becomes just `productA` — no error, just a
> mysteriously empty cart. That is why `cartSetup` wraps its list in an object.
> This was found by running the suite, not by reading the docs.

---

## Configuration and environments

Everything resolves through `config/index.js`, in strict precedence order:

```
explicit env var / CI secret  →  config/environments.js block  →  framework default
```

Switch environments without touching a line of test code:

```bash
TEST_ENV=staging npm test
BASE_URL=https://my-staging-host npm test
HEADLESS=false SLOW_MO=250 npm run test:smoke     # watch it, slowly
WORKERS=1 RETRIES=0 npx playwright test --grep "TC-022"
```

Credentials are never hard-coded in a spec. Locally they come from `.env`; in CI
from repository secrets, with public-demo fallbacks so a fork with no secrets
configured still runs green.

---

## Parallel execution

Parallelism operates at three levels that multiply together:

**1. Within a worker — `fullyParallel: true`**
Every _test_ runs independently, not just every file. A 6-test file occupies 6
workers rather than 1.

**2. Across workers — `workers`**
Defaults to 50% of available cores; `WORKERS=n` or `--workers=n` overrides. Each
worker gets its own browser context: separate cookies, storage and session.

**3. Across machines — CI sharding**
`--shard=1/3` splits the suite deterministically across 3 runners, multiplied by
3 browsers = **9 concurrent jobs**. Results are merged back into one report.

Measured on this suite:

| Mode                              | Executions   | Wall clock           |
| --------------------------------- | ------------ | -------------------- |
| All 5 projects, fully parallel    | 185          | **~1.6 min**         |
| Chromium only, fully parallel     | 37           | **~26 s**            |
| Chromium, sharded 1/3 · 2/3 · 3/3 | 13 · 12 · 12 | **~5–7 s per shard** |

### What makes it safe rather than merely fast

Parallelism is a property of test _design_, not a config flag:

- **No shared state.** Every test builds its own data through factories
  (`validShopper()` generates a fresh postal code per call) — no module-level
  mutable fixtures two workers could fight over.
- **No ordering dependencies.** No test relies on another having run. Any test can
  run alone, in any order, in any browser.
- **Isolated sessions.** Each test authenticates in its own context, so one test
  logging out cannot affect another.
- **No hard sleeps.** `waitForTimeout` is an ESLint **error**. Hard sleeps are the
  primary cause of suites that pass serially and fail in parallel.

---

## Allure reporting

Five reporters run simultaneously, each for a different audience:

| Reporter            | Output                           | Audience                         |
| ------------------- | -------------------------------- | -------------------------------- |
| `list` / `github`   | Console / PR annotations         | The developer who just pushed    |
| `html`              | `playwright-report/`             | Local debugging — embeds traces  |
| `allure-playwright` | `allure-results/`                | The team and stakeholders        |
| `json`              | `test-results/results.json`      | Dashboards and tooling           |
| `junit`             | `test-results/junit-results.xml` | Any CI system's native test view |
| `blob` (CI only)    | `blob-report/`                   | Merging sharded runs             |

### Generate and view

```bash
npm test                  # writes allure-results/
npm run allure:report     # generate + open
npm run allure:serve      # one-shot temporary server
```

### What makes the report actually useful

**Behaviour grouping.** Every test declares `epic → feature → story`, so the
Behaviours tab is organised by business area, not by file path — readable by
someone who has never seen the code:

```
Checkout
├── Order placement      → A shopper can buy products from catalogue to confirmation
├── Form validation      → All shopper detail fields are mandatory
├── Order totals         → Item total, tax and grand total are calculated correctly
└── Abandonment          → A shopper can back out without losing the cart
```

Verified epics in the generated report: `Authentication`, `Product Catalogue`,
`Shopping Cart`, `Checkout`, `Navigation & Session`.

**Readable step logs.** Because `BasePage` wraps every interaction in an Allure
step, each test expands into a narrative — `Log in as "standard_user"` → `Add
"Sauce Labs Backpack" to the cart` → `Proceed to checkout` — with no per-test
bookkeeping.

**Severity and tags.** `blocker` through `trivial`, plus filterable tags
(`@smoke`, `@financial`, `@known-defect`), so triage starts with what matters.

**Data-driven cases are individually parameterised.** All four sort orders appear
as separate entries with their own parameters, so a failure names the exact
scenario without anyone reading the code.

**Environment and executor widgets.** Every report records the environment, base
URL, Node version, platform, and — in CI — a link back to the exact workflow run
that produced it.

**Trend history.** The CI pipeline restores the previous report's history from the
`gh-pages` branch before generating, so the report shows pass-rate and duration
trends over time instead of looking like a first-ever run.

**Attachments.** Failure screenshots, videos, traces, the final DOM, and
deliberate attachments such as TC-020's order confirmation and TC-030's measured
login duration.

---

## CI/CD pipeline

`.github/workflows/playwright.yml` — three stages, 11 jobs.

```
┌──────────────────────────────────────────────────────────────────┐
│  1. lint          ESLint + Prettier          (~1 min, fails fast) │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. test          3 browsers × 3 shards = 9 concurrent jobs       │
│                   fail-fast: false — one browser failing must not │
│                   hide the others' results                        │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. report        Merge all shards → Allure (+ history) →         │
│                   GitHub Pages + merged Playwright HTML +         │
│                   a job summary table                            │
└──────────────────────────────────────────────────────────────────┘
```

### Triggers

| Trigger                             | Purpose                                             |
| ----------------------------------- | --------------------------------------------------- |
| `push` to `main`/`master`/`develop` | Gate every change                                   |
| `pull_request`                      | Gate every PR, with inline annotations              |
| `schedule` (02:00 UTC daily)        | Catch environment drift, not just code changes      |
| `workflow_dispatch`                 | Manual run, choosing suite, browser and environment |

### Details worth noting

- **`concurrency` with `cancel-in-progress`** — a new push cancels the superseded
  run rather than paying for CI minutes on stale code.
- **Browser binary caching** keyed on `package-lock.json` — those binaries are
  ~1 GB and rarely change; this removes minutes from every run.
- **Two report paths.** Allure for the readable, historical report; Playwright's
  own `merge-reports` for the trace-embedded report that is fastest for debugging
  one specific failure.
- **Allure history is restored from `gh-pages`** before generating, so trend
  graphs survive across runs.
- **GitHub Pages publish is branch-guarded**, so a pull request cannot overwrite
  the canonical report.
- **Artefacts are retention-tuned**: Allure results 30 days, traces 14, blobs 7.
- **Traces upload only `if: failure()`** — no storage spent on green runs.
- **A job summary table** posts totals to the Actions run page, so the headline
  result needs no artefact download.

### Enabling the published report

1. Push to `main`. The workflow runs and creates a `gh-pages` branch.
2. **Settings → Pages → Source: `gh-pages` branch**.
3. The report appears at
   `https://YOUR_USERNAME.github.io/playwright-ecommerce-pom-framework/`.
4. Replace `YOUR_USERNAME` in this README's badge URLs.

Optional repository secrets (`Settings → Secrets and variables → Actions`) —
`STANDARD_USER`, `USER_PASSWORD`. Without them the workflow falls back to the
public demo credentials, so a fresh fork still runs green.

### Portability

The pipeline is GitHub Actions, but nothing in the framework is: the runner is
driven entirely by environment variables and CLI flags. Jenkins, GitLab CI or
Azure Pipelines need the same four steps — `npm ci`, `npx playwright install
--with-deps`, `npx playwright test --shard=$i/$n`, publish `allure-results/`. The
JUnit XML reporter is included precisely so any CI system can render native test
summaries without extra work.

---

## Claude Code and Playwright MCP integration

This is the part that makes the framework a _development environment_ rather than
just a test suite. It has three layers, and each one is a real file in this repo.

### What Playwright MCP actually is

The **Model Context Protocol (MCP)** is an open standard for connecting AI
assistants to external tools. The **Playwright MCP server**
(`@playwright/mcp`) exposes a real browser to Claude as a set of callable tools.

The important detail: it works from the **accessibility tree**, not screenshots.
Claude reads a structured, text-based representation of the page — element roles,
names, and `data-test` ids — so it can identify a locator precisely rather than
guessing from pixels. Verified against the live server, it exposes 24 tools,
including:

| Tool                                                       | What it does                                                    |
| ---------------------------------------------------------- | --------------------------------------------------------------- |
| `browser_snapshot`                                         | Accessibility-tree snapshot — the primary way to inspect a page |
| `browser_navigate`                                         | Go to a URL                                                     |
| `browser_click` / `browser_type` / `browser_fill_form`     | Interact with elements                                          |
| `browser_select_option` / `browser_hover` / `browser_drag` | Richer interactions                                             |
| `browser_console_messages`                                 | Read console output — JS errors a test would miss               |
| `browser_network_requests`                                 | Inspect network activity                                        |
| `browser_take_screenshot`                                  | Visual capture when appearance genuinely matters                |
| `browser_wait_for`                                         | Wait on text or a condition                                     |
| `browser_evaluate`                                         | Run JavaScript in page context                                  |

### Layer 1 — `.mcp.json`: the server, pre-configured

Committed to the repo, so Claude Code discovers it automatically when a session
starts here. **Anyone who clones this repo gets a browser-driving Claude with zero
setup.**

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest",
        "--test-id-attribute=data-test",
        "--viewport-size=1920,1080",
        "--isolated",
        "--save-session",
        "--output-dir=.mcp-artifacts"
      ]
    }
  }
}
```

Every flag is a deliberate choice, and all were verified against
`npx @playwright/mcp@latest --help`:

- **`--test-id-attribute=data-test`** is the one that matters most. It mirrors
  `testIdAttribute: 'data-test'` in `playwright.config.js`, so a locator Claude
  discovers through MCP is **the exact locator the framework will use**. Without
  it, MCP would report `data-testid` ids that do not exist in this application and
  every suggestion would need translating.
- **`--isolated`** keeps the browser profile in memory, so an exploration session
  never leaves stale cookies behind to poison the next one.
- **`--viewport-size=1920,1080`** matches the suite's desktop viewport, so Claude
  sees the same layout the tests do.
- **`--output-dir=.mcp-artifacts`** keeps MCP artefacts out of `test-results/`.

Verify the server yourself:

```bash
npx @playwright/mcp@latest --help          # confirm the flags
claude mcp list                            # confirm Claude Code sees it
```

Then, inside Claude Code, `/mcp` lists the connected servers and their tools.

### Layer 2 — `CLAUDE.md`: the conventions

Claude Code loads `CLAUDE.md` automatically into every session in this repository.
It encodes the rules that keep contributions consistent with the framework rather
than merely functional:

- Never put a selector in a spec — locators belong in page objects
- Never put a literal expected string in a spec — it belongs in `src/data/`
- Locate by test id; `playwright.config.js` sets `testIdAttribute`
- Assertion helpers must be named `expect*` so ESLint recognises them
- No hard sleeps — `waitForTimeout` is an ESLint error
- Every test declares Allure metadata with a `TC-0NN` id

It also records **hard-won facts about the application** that would otherwise be
rediscovered painfully:

- The cart badge is _removed from the DOM_ when empty, not set to `0` — so assert
  `toHaveCount(0)`, never `toHaveText('0')`
- `data-test="open-menu"` sits on an `<img>` that its parent `<button>`
  intercepts, so the click must target `#react-burger-menu-btn`
- `.bm-menu-wrap` keeps `aria-hidden="true"` even when the drawer is open, so
  drawer state must be asserted via link visibility

Each of those cost a real debugging cycle to find. Writing them down means they
cost that once.

### Layer 3 — `.claude/commands/`: repeatable workflows

Three custom slash commands turn the integration into actual workflow, each
scoped to only the MCP tools it needs:

| Command                                      | What it does                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`/explore-page cart`**                     | Reconnaissance. Navigates to the page, snapshots the accessibility tree, and reports every interactive element with its real `data-test` id, the exact visible copy, and anything that would make a naive locator flaky. Ends by naming which page object should own it. Writes no code.                                    |
| **`/new-test "cart badge survives logout"`** | Drives the journey through MCP **first** to confirm the behaviour is real, finds the next free `TC-0NN`, extends the page objects, writes the spec to convention, then verifies with `npm run lint` and a real test run.                                                                                                    |
| **`/triage`**                                | Reads `test-results/results.json` and the failure artefacts, reproduces through MCP, checks console and network, then classifies each failure as **application defect**, **test defect**, **flaky test**, or **environment** — with evidence, before changing anything. Adding a retry is explicitly not an acceptable fix. |

### Why this changes how tests get written

The conventional loop is: guess a selector, run the suite, watch it fail, read the
error, guess again. Each iteration costs a full browser run.

With MCP the loop inverts — **observe, then write**:

1. `/explore-page checkout-step-one` — Claude opens the real page and reports the
   actual ids (`firstName`, `lastName`, `postalCode`, `continue`, `cancel`) and
   the exact error copy (`Error: First Name is required`)
2. The page object is written against observed truth, not assumption
3. The spec is written against the page object
4. `npx playwright test` confirms it — usually first try

Every selector and every expected string in this repository was verified this way
against the live application before being committed. The error messages in
`src/data/messages.js`, the six product prices, the 8% tax rate, the confirmation
copy, the `problem_user` image defect — all observed, none guessed.

> **Division of labour, stated plainly:** MCP proves how the _application_
> behaves. `npx playwright test` proves the _test_ works. The second is not
> optional — a test that has never run in the real runner is not a passing test,
> and `CLAUDE.md` makes that explicit.

### Using it yourself

```bash
npm install -g @anthropic-ai/claude-code   # if not already installed
cd playwright-ecommerce-pom-framework
claude                                     # .mcp.json + CLAUDE.md load automatically
```

Then try:

```
/mcp                                   # confirm the Playwright server is connected
/explore-page /checkout-step-two.html  # reconnaissance on the order summary
/new-test "sorting selection survives a page reload"
/triage                                # after a failing run
```

---

## Design decisions and trade-offs

Choices worth defending, and what was given up for each.

**JavaScript, not TypeScript.** TypeScript would catch page-object typos at
compile time and is what I would choose for a large team framework. JavaScript
with thorough JSDoc was chosen here so the framework is readable without a build
step and approachable to reviewers who do not write TypeScript. Editors still get
autocomplete from the JSDoc annotations. _Trade-off accepted: no compile-time
locator checking._

**CommonJS, not ESM.** Maximum compatibility with every Playwright reporter and
tool, with no loader flags. _Trade-off: less modern-looking imports._

**A stable demo application.** `saucedemo.com` was chosen deliberately over a
richer target: it is reliable, rate-limit free, and has no flaky third-party
dependencies, so a red build means a real regression rather than someone else's
outage. A portfolio framework whose CI fails randomly demonstrates the opposite of
what it intends. _Trade-off: no file upload, search, or pagination to model._

**Page objects hold assertions.** A stricter reading of POM says page objects
return state and specs assert. Encapsulating assertions as `expect*` methods was
chosen because it removes real duplication —
`expectTotalsAreArithmeticallyCorrect()` is 12 lines of financial logic that
would otherwise be copy-pasted into every checkout test. _Trade-off: page objects
depend on `@playwright/test`'s `expect`._

**Fixtures, not `beforeEach`.** Lazier, composable, and parallel-safe by
construction. _Trade-off: a Playwright-specific concept a newcomer must learn._

**A documented bug as a test (TC-029).** Skipping `problem_user` would have been
easier. Asserting the defect exists, linked to `DEMO-1042`, means the suite is a
record of known issues and will tell us when one is fixed.

**Tests assert business rules, not just rendering.** TC-022 recomputes tax
independently rather than trusting the page. The most expensive e-commerce bugs
are arithmetic, not layout.

### Known limitations

Stated plainly, because a framework's boundaries matter as much as its features:

- **No API-layer tests.** The demo application has no meaningful public API.
  Real-world value would come from seeding state via API and asserting UI
  consequences.
- **No visual regression testing.** Playwright supports
  `toHaveScreenshot()`; it was left out because pixel baselines across three
  browsers and two mobile viewports are a maintenance burden that would not pay
  for itself on a six-product demo.
- **No accessibility scanning.** `@axe-core/playwright` would be a natural and
  genuinely valuable addition.
- **`storageState` authentication is not used.** Every test logs in through the
  UI. Caching an authenticated session would cut a few seconds per test, but
  logging in _is_ part of what several tests verify, and at 26 seconds for the
  full Chromium run the optimisation would buy little.
- **Single-user scope.** No concurrency or multi-role scenarios, because the demo
  application has no shared server-side state to contend over.

---

## Troubleshooting

<details>
<summary><b>Browsers are missing or fail to launch</b></summary>

```bash
npx playwright install --with-deps      # binaries plus OS libraries (Linux)
npx playwright install chromium         # or just one
```

On Linux without `--with-deps`, browsers fail with missing shared libraries.
</details>

<details>
<summary><b>`allure: command not found`</b></summary>

The Allure CLI is a Java tool. Either install it (`brew install allure`) or use
the bundled npm version:

```bash
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

Check `java -version` — Java 8+ is required for the CLI. Note that running the
tests never needs Java; only viewing the report locally does.
</details>

<details>
<summary><b>The Allure report is empty or shows the wrong run</b></summary>

`globalSetup` clears `allure-results/` at the start of every run, so results
never mix. If a report looks stale you are probably viewing an old
`allure-report/`. Regenerate:

```bash
npm run allure:clean && npm test && npm run allure:report
```

</details>

<details>
<summary><b>Tests pass individually but fail together</b></summary>

That is a shared-state or timing bug — exactly what this framework is designed to
prevent, so treat it as a real defect rather than adding a retry.

```bash
npm run test:serial                     # confirm it is concurrency-related
npx playwright test --grep "TC-0NN" --repeat-each=5 --workers=4
```

Then check: is the test mutating module-level data instead of using a factory? Is
it asserting on a count that another test could change? In Claude Code, `/triage`
walks this systematically.
</details>

<details>
<summary><b>Claude Code does not see the Playwright MCP server</b></summary>

```bash
claude mcp list                          # is "playwright" listed?
npx @playwright/mcp@latest --help        # does the server itself run?
```

Start Claude Code from the **repository root** — `.mcp.json` is project-scoped and
is only discovered there. The first launch downloads the package, so give it a
moment. Inside Claude Code, `/mcp` shows connection status.
</details>

<details>
<summary><b>CI fails but local passes</b></summary>

CI runs headless on Linux with different fonts and timing. Reproduce it:

```bash
CI=true HEADLESS=true npx playwright test --project=chromium
```

Then download the `traces-*` artefact from the failed job and open it — the trace
replays the exact failing run:

```bash
npx playwright show-trace path/to/trace.zip
```

</details>

<details>
<summary><b>The suite is slower than expected</b></summary>

Check worker allocation — `WORKERS=` blank uses 50% of cores:

```bash
npm run test:parallel                   # force 4 workers
npx playwright test --project=chromium  # one browser instead of five
npm run test:smoke                      # critical path only
```

`TRACE_MODE=off VIDEO_MODE=off` also speeds up a run when you do not need
artefacts.
</details>

---

## License

MIT — see [LICENSE](LICENSE).

## Author

**Ritesh Zingare** — QA Automation Engineer

Built as a portfolio demonstration of Playwright framework architecture,
CI/CD-ready test design, and AI-assisted test development with Claude Code and
Playwright MCP.
