import { test, expect } from '@playwright/test';

test('CSV import page screenshot', async ({ page }) => {
  // Navigate to the CSV import page
  await page.goto('http://localhost:3002/csv-import');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot
  await page.screenshot({ path: 'csv-import-page.png', fullPage: true });
  
  // Verify the page title
  const h1 = await page.locator('h1').textContent();
  console.log('Page title:', h1);
});