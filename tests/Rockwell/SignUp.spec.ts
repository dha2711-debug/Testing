import { test, expect } from '../playwright-helpers';

function generateRandomString(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function buildUserData() {
  const firstName = `User${generateRandomString(4)}`;
  const lastName = `Test${generateRandomString(4)}`;
  const timestamp = Date.now();
  const email = `user.${firstName.toLowerCase()}.${timestamp}@example.com`;
  return { firstName, lastName, country: 'India', email };
}

async function navigateToCreateAccount(page) {
  const userIcon = page.getByRole('button', { name: /Sign In|Account|User/i }).first();
  await userIcon.click();

  const createAccountAction = page.getByRole('link', { name: /Create an Account|Create Account|Create one here|Create an account/i }).first();
  if (await createAccountAction.count() > 0 && await createAccountAction.isVisible()) {
    await createAccountAction.click();
    console.log('Clicked Create Account action.');
    return;
  }

  const createAccountButton = page.getByRole('button', { name: /Create an Account|Create Account/i }).first();
  if (await createAccountButton.count() > 0 && await createAccountButton.isVisible()) {
    await createAccountButton.click();
    console.log('Clicked Create Account button.');
    return;
  }

  throw new Error('Create Account action not found after clicking user icon.');
}

async function fillSignUpForm(page, user) {
  await page.waitForTimeout(5000);
  await expect(page.locator('input[id*="first"], input[name*="first"], input[placeholder*="First"]')).toBeVisible({ timeout: 15000 });

  const firstNameInput = page.locator('input[name="firstName"], input[id="firstName"], input[placeholder*="First"]').first();
  if (await firstNameInput.count() > 0) {
    await expect(firstNameInput).toBeVisible({ timeout: 10000 });
    await firstNameInput.fill(user.firstName);
    console.log(`Entered first name: ${user.firstName}`);
  } else {
    console.log('First name field not found.');
  }

  const lastNameInput = page.locator('input[name="lastName"], input[id="lastName"], input[placeholder*="Last"]').first();
  if (await lastNameInput.count() > 0) {
    await expect(lastNameInput).toBeVisible({ timeout: 10000 });
    await lastNameInput.fill(user.lastName);
    console.log(`Entered last name: ${user.lastName}`);
  } else {
    console.log('Last name field not found.');
  }

  let countrySelected = false;
  const allSelects = await page.locator('select').all();
  if (allSelects.length > 0) {
    for (const select of allSelects) {
      const options = await select.locator('option').allTextContents();
      if (options.some(opt => opt.toLowerCase().includes('india'))) {
        await select.selectOption({ label: 'India' });
        console.log('Selected India from standard select');
        countrySelected = true;
        break;
      }
    }
  }

  if (!countrySelected) {
    console.log('Trying Material Design mat-select...');
    const matSelect = page.locator('mat-select[name="country"], mat-select[formcontrolname="country"]').first();
    if (await matSelect.count() > 0) {
      console.log('Found mat-select element');
      await matSelect.click();
      await page.waitForTimeout(800);
      const indiaOption = page.locator('mat-option:has-text("India")').first();
      if (await indiaOption.count() > 0) {
        await indiaOption.click();
        console.log('Selected India from mat-select dropdown');
        countrySelected = true;
      } else {
        const indiaByRole = page.getByRole('option', { name: 'India' }).first();
        if (await indiaByRole.count() > 0) {
          await indiaByRole.click();
          console.log('Selected India from dropdown (by role)');
          countrySelected = true;
        }
      }
    }
  }

  if (!countrySelected) {
    console.log('Warning: Country dropdown not found or could not select India');
  }

  const emailInput = page.locator('input[type="email"], input[name="email"], input[id="email"]').first();
  if (await emailInput.count() > 0) {
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill(user.email);
    console.log(`Entered email address: ${user.email}`);
  } else {
    console.log('Email field not found.');
  }
}

async function clickContinue(page) {
  const continueButton = page.getByRole('button', { name: /Continue|Submit|Next/i }).first();
  if (await continueButton.count() > 0 && await continueButton.isVisible()) {
    await continueButton.click();
    console.log('Clicked Continue button.');
    return;
  }

  const continueTextButton = page.locator('button:has-text("Continue"), button:has-text("Submit"), button:has-text("Next")').first();
  if (await continueTextButton.count() > 0 && await continueTextButton.isVisible()) {
    await continueTextButton.click();
    console.log('Clicked Continue button by text fallback.');
    return;
  }

  throw new Error('Continue button not found.');
}

async function completeVerificationIfNeeded(page) {
  const verificationCode = process.env.VERIFICATION_CODE ?? '123456';
  const verificationInput = page.locator('input[name="verificationCode"], input[id*="verification"], input[placeholder*="Verification"], input[placeholder*="code"]').first();
  if (await verificationInput.count() > 0) {
    await expect(verificationInput).toBeVisible({ timeout: 15000 });
    await verificationInput.fill(verificationCode);
    console.log(`Entered verification code: ${verificationCode}`);

    const verifyButton = page.getByRole('button', { name: /Verify|Submit|Continue/i }).first();
    if (await verifyButton.count() > 0 && await verifyButton.isVisible()) {
      await verifyButton.click();
      console.log('Clicked verification submit button.');
    } else {
      console.log('Verification submit button not found.');
    }
  } else {
    console.log('Verification input not found; continuing without code entry.');
  }
}

async function signOutIfLoggedIn(page) {
  const signOutButton = page.getByRole('button', { name: /Sign Out|Logout|Log out|Sign off/i }).first();
  if (await signOutButton.count() > 0 && await signOutButton.isVisible()) {
    await signOutButton.click();
    console.log('Signed out using sign-out button.');
    await page.waitForTimeout(2000);
    return;
  }

  const signOutLink = page.locator('text=/Sign Out|Logout|Log out|Sign off/i').first();
  if (await signOutLink.count() > 0 && await signOutLink.isVisible()) {
    await signOutLink.click();
    console.log('Signed out using sign-out link.');
    await page.waitForTimeout(2000);
  }
}

async function expectDuplicateRegistrationValidation(page) {
  const duplicateLocators = [
    page.locator('text=/already.*(exists|registered|in use|used)/i'),
    page.locator('text=/email.*already.*(exists|registered|in use|used)/i'),
    page.locator('text=/account.*already.*(exists|registered|in use)/i'),
    page.locator('text=/The email address is already in use\./i'),
    page.locator('mat-error:has-text("already")'),
    page.locator('.error:has-text("already")'),
    page.locator('.validation-message:has-text("already")'),
  ];

  for (const locator of duplicateLocators) {
    if (await locator.count() > 0) {
      await expect(locator.first()).toBeVisible({ timeout: 15000 });
      console.log('Duplicate registration validation message displayed.');
      return;
    }
  }

  await page.waitForTimeout(1500);
  const bodyText = await page.locator('body').innerText();
  const duplicatePatterns = [
    /already.*(exists|registered|in use|used)/i,
    /email.*already.*(exists|registered|in use|used)/i,
    /account.*already.*(exists|registered|in use)/i,
    /The email address is already in use\./i,
  ];

  for (const pattern of duplicatePatterns) {
    if (pattern.test(bodyText)) {
      console.log('Duplicate registration validation message found in page body text.');
      return;
    }
  }

  const verificationPage = page.locator('text=/We’ve sent an email with the code to/i');
  if (await verificationPage.count() > 0 && await verificationPage.isVisible()) {
    throw new Error('Duplicate registration validation not shown; flow advanced to the verification page.');
  }

  throw new Error('Duplicate registration validation message not found after duplicate registration attempt.');
}

test('Login to Rockwell Automation', async ({ page }) => {
  const user = buildUserData();

  // 1. Increase timeout for this specific test if the site is slow
  test.setTimeout(90000);

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

  // 4. Click the create account button/link inside the popup menu
  const createAccountAction = page.getByRole('link', { name: /Create an Account|Create Account|Create one here|Create an account/i }).first();
  if (await createAccountAction.count() > 0 && await createAccountAction.isVisible()) {
    await createAccountAction.click();
    console.log('Clicked Create Account action.');
  } else {
    const createAccountButton = page.getByRole('button', { name: /Create an Account|Create Account/i }).first();
    if (await createAccountButton.count() > 0 && await createAccountButton.isVisible()) {
      await createAccountButton.click();
      console.log('Clicked Create Account button.');
    } else {
      throw new Error('Create Account action not found after clicking user icon.');
    }
  }

  console.log('Successfully navigated to the Create Account page!');
  await page.waitForTimeout(5000);  // Increased wait for form to fully load

  // Wait for at least one form field to be visible
  await expect(page.locator('input[id*="first"], input[name*="first"], input[placeholder*="First"]')).toBeVisible({ timeout: 15000 });

  // 5. Fill in user information

  // 5.1 Enter First Name
  const firstNameInput = page.locator('input[name="firstName"], input[id="firstName"], input[placeholder*="First"]').first();
  if (await firstNameInput.count() > 0) {
    await expect(firstNameInput).toBeVisible({ timeout: 10000 });
    await firstNameInput.fill(user.firstName);
    console.log(`Entered first name: ${user.firstName}`);
  } else {
    console.log('First name field not found.');
  }

  // 5.2 Enter Last Name
  const lastNameInput = page.locator('input[name="lastName"], input[id="lastName"], input[placeholder*="Last"]').first();
  if (await lastNameInput.count() > 0) {
    await expect(lastNameInput).toBeVisible({ timeout: 10000 });
    await lastNameInput.fill(user.lastName);
    console.log(`Entered last name: ${user.lastName}`);
  } else {
    console.log('Last name field not found.');
  }

  // 5.3 Select Country from Dropdown (Material Design mat-select)
  try {
    // First try standard select elements
    const allSelects = await page.locator('select').all();
    console.log(`Found ${allSelects.length} standard select elements`);
    
    let countrySelected = false;
    
    if (allSelects.length > 0) {
      for (const select of allSelects) {
        const options = await select.locator('option').allTextContents();
        if (options.some(opt => opt.toLowerCase().includes('india'))) {
          await select.selectOption({ label: 'India' });
          console.log('Selected India from standard select');
          countrySelected = true;
          break;
        }
      }
    }
    
    // If no standard select, try Material Design mat-select
    if (!countrySelected) {
      console.log('Trying Material Design mat-select...');
      
      // Find mat-select by name or role
      const matSelect = page.locator('mat-select[name="country"], mat-select[formcontrolname="country"]').first();
      if (await matSelect.count() > 0) {
        console.log('Found mat-select element');
        await matSelect.click();
        await page.waitForTimeout(800);
        
        // Find and click India option from the opened dropdown panel
        const indiaOption = page.locator('mat-option:has-text("India")').first();
        if (await indiaOption.count() > 0) {
          await indiaOption.click();
          console.log('Selected India from mat-select dropdown');
          countrySelected = true;
        } else {
          // Try by role
          const indiaByRole = page.getByRole('option', { name: 'India' }).first();
          if (await indiaByRole.count() > 0) {
            await indiaByRole.click();
            console.log('Selected India from dropdown (by role)');
            countrySelected = true;
          }
        }
      }
    }
    
    if (!countrySelected) {
      console.log('Warning: Country dropdown not found or could not select India');
    }
  } catch (error) {
    let errorMsg = 'Unknown error';
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (typeof error === 'string') {
      errorMsg = error;
    } else if (error && typeof error === 'object') {
      errorMsg = JSON.stringify(error);
    }
    console.log('Error selecting country:', errorMsg);
  }

  // 5.4 Enter Email Address
  const emailInput = page.locator('input[type="email"], input[name="email"], input[id="email"]').first();
  if (await emailInput.count() > 0) {
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill(user.email);
    console.log(`Entered email address: ${user.email}`);
  } else {
    console.log('Email field not found.');
  }

  // 6. Click Continue after filling all details
  const continueButton = page.getByRole('button', { name: /Continue|Submit|Next/i }).first();
  if (await continueButton.count() > 0 && await continueButton.isVisible()) {
    await continueButton.click();
    console.log('Clicked Continue button.');
  } else {
    const continueTextButton = page.locator('button:has-text("Continue"), button:has-text("Submit"), button:has-text("Next")').first();
    if (await continueTextButton.count() > 0 && await continueTextButton.isVisible()) {
      await continueTextButton.click();
      console.log('Clicked Continue button by text fallback.');
    } else {
      console.log('Continue button not found.');
    }
  }

  // 7. Enter configurable verification code if required
  const verificationCode = (process.env.VERIFICATION_CODE) ?? '123456';
  const verificationInput = page.locator('input[name="verificationCode"], input[id*="verification"], input[placeholder*="Verification"], input[placeholder*="code"]').first();
  if (await verificationInput.count() > 0) {
    await expect(verificationInput).toBeVisible({ timeout: 15000 });
    await verificationInput.fill(verificationCode);
    console.log(`Entered verification code: ${verificationCode}`);

    const verifyButton = page.getByRole('button', { name: /Verify|Submit|Continue/i }).first();
    if (await verifyButton.count() > 0 && await verifyButton.isVisible()) {
      await verifyButton.click();
      console.log('Clicked verification submit button.');
    } else {
      console.log('Verification submit button not found.');
    }
  } else {
    console.log('Verification input not found; continuing without code entry.');
  }
  // 8. Attempt registration again with the same user details to verify duplicate prevention.
  await signOutIfLoggedIn(page);
  await page.goto('https://www.rockwellautomation.com/');
  await navigateToCreateAccount(page);
  console.log('Attempting duplicate registration with the same account details.');

  await fillSignUpForm(page, user);
  await clickContinue(page);
  await expectDuplicateRegistrationValidation(page);


});