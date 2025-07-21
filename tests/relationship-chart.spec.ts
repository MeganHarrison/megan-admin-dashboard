import { test, expect } from '@playwright/test';

test('relationship chart page loads without errors', async ({ page }) => {
  // Check for console errors
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Navigate to the relationship chart page
  const response = await page.goto('http://localhost:3002/relationship/relationship-chart');
  
  // Verify the page loaded successfully
  expect(response?.status()).toBe(200);
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check that the canvas element exists
  const canvas = await page.locator('#relationship-chart-canvas');
  await expect(canvas).toBeVisible();
  
  // Check that the title is displayed
  const title = await page.locator('h1');
  await expect(title).toHaveText('Relationship Chart');
  
  // Take a screenshot to verify the chart rendered
  await page.screenshot({ path: 'relationship-chart-success.png' });
  
  // Verify no console errors occurred
  if (consoleErrors.length > 0) {
    console.log('Console errors found:', consoleErrors);
  }
  expect(consoleErrors).toHaveLength(0);
});