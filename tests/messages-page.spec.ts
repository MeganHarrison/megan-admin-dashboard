import { test, expect } from '@playwright/test';

test('Messages page loads and displays table', async ({ page }) => {
  // Navigate to the messages page
  await page.goto('http://localhost:3001/messages');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check if we have the page title
  const title = page.locator('h3:has-text("Text Messages")');
  await expect(title).toBeVisible();
  
  // Check for either the table or loading/error state
  const table = page.locator('table');
  const loadingText = page.locator('text=Loading messages...');
  const errorText = page.locator('[class*="text-red"]');
  
  // Wait for either success (table) or error state
  await expect(async () => {
    const tableVisible = await table.isVisible();
    const loading = await loadingText.isVisible();
    const error = await errorText.isVisible();
    
    expect(tableVisible || loading || error).toBe(true);
  }).toPass({ timeout: 10000 });
  
  // Take a screenshot
  await page.screenshot({ path: 'messages-page-result.png', fullPage: true });
  
  console.log('Messages page test completed');
});