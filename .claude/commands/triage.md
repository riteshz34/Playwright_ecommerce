---
description: Triage the last failing run - read the trace, reproduce with MCP, decide bug vs flaky test
allowed-tools: Bash, Read, Grep, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_console_messages, mcp__playwright__browser_network_requests
---

Triage the most recent test failures.

1. Read `test-results/results.json` for what failed and the error messages.
2. For each distinct failure, inspect the artefacts in `test-results/` — the
   error context, the failure screenshot, and the DOM attachment the
   `reportOnFailure` fixture captures.
3. Re-run the failing test alone to see whether it reproduces:
   `npx playwright test --grep "TC-0NN" --retries=0`
4. Then reproduce the journey **manually through Playwright MCP** and compare what
   the application actually does against what the test asserts. Check
   `browser_console_messages` and `browser_network_requests` for errors the test
   itself would not surface.
5. Classify each failure explicitly, with your evidence:
   - **Application defect** — the app is wrong; the test is right. Describe the
     defect and the reproduction steps.
   - **Test defect** — the assertion or locator is wrong. Propose the fix.
   - **Flaky test** — passes alone, fails under parallel load, or depends on
     timing. Identify the specific race and fix the root cause. Adding a retry or
     a `waitForTimeout` is not an acceptable fix in this framework.
   - **Environment** — the demo application or the network was unavailable.
6. Report a short table of failure → classification → recommended action. Do not
   change any test until the classification is stated.
