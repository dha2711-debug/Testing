import { test as base, expect } from '@playwright/test';

const test = base.extend({});

// Add a short delay after every test run.
test.afterEach(async ({ page }) => {
  await page.waitForTimeout(3000);
});

export { test, expect };
