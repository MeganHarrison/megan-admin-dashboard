import { test, expect } from '@playwright/test';

test('should show data source toggle on messages page', async ({ page }) => {
  await page.goto('http://localhost:3000/messages');
  await page.waitForLoadState('networkidle');
  
  // Check if the data source toggle is visible
  await expect(page.locator('text=Data Source:')).toBeVisible();
  await expect(page.locator('text=Try Live Database (30,250 messages)')).toBeVisible();
  
  // Check if sample data is being used by default
  await expect(page.locator('text=Showing 1 to 3 of 3 messages')).toBeVisible();
  
  // Try toggling to live database
  await page.locator('text=Try Live Database (30,250 messages)').click();
  
  // Should show warning about local development
  await expect(page.locator('text=May not work in local development')).toBeVisible();
});