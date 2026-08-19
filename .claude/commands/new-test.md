---
description: Add a test case to the suite, verifying real app behaviour with MCP before writing it
argument-hint: <what the test should cover, e.g. "cart badge persists after logout and login">
allowed-tools: mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_fill_form, Read, Edit, Write, Bash
---

Add a test covering: **$ARGUMENTS**

Follow this framework's conventions exactly — read `CLAUDE.md` first if anything
below is ambiguous.

1. **Confirm the behaviour is real.** Drive the journey through Playwright MCP
   against the live application first. Never write an assertion against copy or a
   locator you have not observed. If the application does not behave as the
   request assumes, stop and say so rather than writing a test that will fail.

2. **Find the next free test id.** Grep `tests/` for `TC-0` and take the next one.

3. **Extend the page objects, not the spec.** Any new locator or interaction goes
   in `src/pages/`. Any new expected string goes in `src/data/messages.js`. The
   spec must contain no selectors and no literal expected copy.

4. **Write the spec** in the suite file matching the business area. It must:
   - open with `annotate({ epic, feature, story, severity, testCaseId, tags,
description })`, where `description` explains why the test matters
   - use the fixtures from `src/fixtures/pages.fixture.js` rather than a
     `beforeEach` login block
   - carry `@regression`, plus `@smoke` if it is critical path

5. **Verify for real**, and report the actual output:
   ```bash
   npm run lint
   npx playwright test --grep "TC-0NN" --project=chromium
   ```
   Then confirm it is parallel-safe by running it alongside its whole suite file —
   a test that only passes in isolation is not finished.
