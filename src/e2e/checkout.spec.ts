
import { test, expect } from '@playwright/test';

test('Critical Path: Guest can view property and reach checkout', async ({ page }) => {
  // 1. Land on Home
  await page.goto('/');
  await expect(page).toHaveTitle(/Gaya3/);

  // 2. Click first property
  await page.click('text=Nebula Glasshouse');
  
  // 3. Verify Property Details
  await expect(page.locator('h1')).toContainText('Nebula Glasshouse');
  
  // 4. Click Reserve (Should redirect to Auth if not logged in, or Checkout if logged in)
  // Note: In a real test, we would mock the Auth state or perform a login flow first.
  await page.click('text=RESERVE NOW');
  
  // 5. Check redirection logic
  if (page.url().includes('/auth')) {
    await expect(page.locator('text=LOGIN')).toBeVisible();
  } else {
    await expect(page.url()).toContain('/checkout');
  }
});
