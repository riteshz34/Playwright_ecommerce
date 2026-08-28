# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/login.spec.js >> Authentication @regression >> TC-002 | a locked-out user is refused with an explanatory message
- Location: tests/auth/login.spec.js:40:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /home/runner/.cache/ms-playwright/webkit-2336/pw_run.sh
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```