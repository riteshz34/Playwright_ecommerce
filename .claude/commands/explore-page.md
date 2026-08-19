---
description: Explore a page of the app under test with Playwright MCP and report its real locators
argument-hint: <page name or URL path, e.g. "cart" or "/checkout-step-one.html">
allowed-tools: mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_fill_form, mcp__playwright__browser_console_messages, Read
---

Explore `$1` in the live application using the Playwright MCP server and report
back what a page object for it would need.

Steps:

1. Read `config/environments.js` for the base URL, and `src/data/messages.js` for
   the copy this framework already expects.
2. Navigate to the target page. Most pages require authentication first — sign in
   with `standard_user` / `secret_sauce` via the login form.
3. Take a `browser_snapshot` (not a screenshot — the accessibility tree is cheaper
   and names things).
4. Report:
   - every interactive element, with its **`data-test` id** (this project locates
     by test id, so a raw CSS selector is not an acceptable answer)
   - the exact visible text of any heading, label or error message
   - which elements are absent versus merely hidden, if that distinction matters
     for assertions on this page
5. Note anything that would make a naive locator flaky: elements intercepted by a
   parent, animated containers, attributes that do not update.
6. Finish by stating which existing page object under `src/pages/` should own this
   page, or that a new one is needed — and list the methods it should expose.

Do not write any test code in this command. This is reconnaissance; the findings
feed the page object.
