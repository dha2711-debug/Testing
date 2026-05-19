import { test, expect } from '../playwright-helpers';

test('Login to Rockwell Automation', async ({ page }) => {
  // 1. Increase timeout for this specific test if the site is slow
  test.setTimeout(60000);

  await page.goto('https://www.rockwellautomation.com/');

  // 2. Handle Cookie Banner (CRITICAL)
  // This looks for an "Accept" button. If it doesn't exist, it moves on.
  const cookieButton = page.getByRole('button', { name: /Accept All|Agree/i });
  if (await cookieButton.isVisible()) {
    await cookieButton.click();
  }

  // 3. Click the Account/User Icon
  // Instead of ID, we use the accessibility name which is more stable
  const userIcon = page.getByRole('button', { name: /Sign In|Account|User/i }).first();
  await userIcon.click();

  // 4. Click the "Sign In" link inside the popup menu
  // We wait for it to be visible first
  const signInLink = page.locator('a:has-text("Sign In")').first();
  await expect(signInLink).toBeVisible({ timeout: 10000 });
  await signInLink.click();

  console.log('Successfully navigated to the Login page!');
  await page.waitForTimeout(3000);

  // 1. After clicking Sign In, wait for the email input to appear
// Most login pages use 'input[type="email"]' or an ID like '#email'
const emailInput = page.locator('input[type="text"], input[name="emailInput"], #email').first();

// 2. Wait for it to be visible (gives the new page time to load)
await expect(emailInput).toBeVisible({ timeout: 15000 });

// 3. Fill the email address
await emailInput.fill('dha2711@gmail.com'); 

// 4. Usually, you need to click "Next" or "Continue"
await page.keyboard.press('Enter'); 
// OR: await page.getByRole('button', { name: /Next|Continue/i }).click();

console.log('Valid email!');

// 1. After Enter email, wait for the password screen to appear
// Most login pages use 'input[type="Password"]' or an ID like '#passwordInput'
const passwordInput = page.locator('input[type="password"], input[name="passwordInput"], #passwordInput').first();

// 2. Wait for it to be visible (gives the new page time to load)
await expect(passwordInput).toBeVisible({ timeout: 15000 });

// 3. Fill the email address
await passwordInput.fill('Dha@2711');

// 4. Usually, you need to click "Next" or "Continue"
await page.keyboard.press('Enter'); 
// OR: await page.getByRole('button', { name: /Next|Continue/i }).click();

console.log('Invalid password!');

// 5. If the login fails, click the "Go back" button to return.
const goBackButton = page.getByRole('button', { name: /Go back|Back|Return/i }).first();
if (await goBackButton.count() > 0 && await goBackButton.isVisible()) {
  await goBackButton.click();
  console.log('Clicked Go back button to return to the previous page.');

  // 6. After going back, click "Create one here" if it is available.
  const createAccountLink = page.getByRole('link', { name: /Create one here|create one here|Create One Here/i }).first();
  if (await createAccountLink.count() > 0 && await createAccountLink.isVisible()) {
    await createAccountLink.click();
    console.log('Clicked Create one here link.');
  } else {
    console.log('Create one here link was not visible after going back.');
  }
}

});