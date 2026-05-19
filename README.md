# Playwright Tests

This repository contains Playwright tests under `tests/`.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Run all tests:

```bash
npm test
```

3. Run tests in headed mode:

```bash
npm run test:headed
```

4. Run tests in mobile emulation mode:

```bash
npm run test:mobile
```

5. Open the Playwright HTML report:

```bash
npm run test:report
```

## Notes

- Configuration is in `playwright.config.ts`.
- Tests live in `tests/` and can use Playwright fixtures from `@playwright/test`.
- `Login.spec.ts` currently includes a Rockwell Automation login flow example.
