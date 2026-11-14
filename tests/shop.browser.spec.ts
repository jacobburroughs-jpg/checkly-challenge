/**
 * Shop journey: guest adds a product to the cart and is prompted to sign up at checkout.
 * Runs as a Checkly Browser check (matched by *.browser.spec.ts in tests/playwright.check.ts).
 *
 * Changes from the original test:
 *
 * 1. Assertions now run. `expect(x).toBeVisible` had no `()`, so the check never ran,
 *    and no `await`, so the test never waited for the result. Each is now
 *    `await expect(x).toBeVisible()`, which retries for up to 5s and fails at the
 *    step that is actually broken.
 *
 * 2. "Continue Shopping" is a <button> on the site, not a link.
 *    getByRole('link', ...) could never match it, so the test timed out (30s).
 *    Changed to getByRole('button', ...).
 *
 * 3. The checkout popup's link says "Register / Login", not "Register / Signup".
 *    Changed the name to match the page.
 *
 * 4. Cleanup: removed a hidden icon character (U+E8F8) from the "Products" link name.
 *    It came from the site's icon font and is invisible in editors, which makes it fragile.
 *    Name matching is a substring match by default, so 'Products' is enough.
 *
 * 5. Renamed the test from 'test' to describe the journey, so failures are easy to read.
 */
import { test, expect } from '@playwright/test';

test('guest can add product to cart and reach signup', async ({ page }) => {
  await page.goto('https://www.automationexercise.com/');
  const consentButton = page.getByRole('button', { name: 'Consent' });
  if (await consentButton.isVisible()) {
    await consentButton.click();
  } else {
    console.log('GDPR does not apply.');
  }
  await page.getByRole('link', { name: 'Products' }).click();
  const searchBar = page.getByPlaceholder('Search Product');
  await expect(searchBar).toBeVisible();
  const addBlueTopButton = page.locator('div.productinfo a[data-product-id="1"]');
  await addBlueTopButton.click();
  const modalHeading = page.getByRole('heading', { name: "Added!"});
  await expect(modalHeading).toBeVisible();
  await page.getByRole('button', { name: 'Continue Shopping' }).click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByText('Proceed To Checkout').click();
  await page.getByRole('link', { name: 'Register / Login' }).click();
  const signupHeading = page.getByRole('heading', { name: 'New User Signup!'});
  await expect(signupHeading).toBeVisible();
});