import { test, expect } from '@playwright/test';

test('should display both TailAdmin and shadcn components together', async ({ page }) => {
  await page.goto('http://localhost:3000/shadcn-demo');
  await page.waitForLoadState('networkidle');
  
  // Check page title
  await expect(page.locator('h2:has-text("shadcn/ui Demo")')).toBeVisible();
  
  // Check TailAdmin section
  await expect(page.locator('text=Your Existing TailAdmin Components')).toBeVisible();
  await expect(page.locator('button:has-text("Primary")')).toBeVisible();
  
  // Check shadcn section  
  await expect(page.locator('text=New shadcn/ui Components')).toBeVisible();
  await expect(page.locator('button:has-text("Default")')).toBeVisible();
  
  // Test dialog functionality
  await page.locator('button:has-text("Open Dialog")').click();
  await expect(page.locator('text=Amazing Dialog with Accessibility')).toBeVisible();
  
  // Test input interaction
  const input = page.locator('input[placeholder*="Message to analyze"]');
  await input.fill('Testing shadcn components!');
  await expect(page.locator('text=You typed: "Testing shadcn components!"')).toBeVisible();
});

test('should show migration guide', async ({ page }) => {
  await page.goto('http://localhost:3000/shadcn-demo');
  await page.waitForLoadState('networkidle');
  
  await expect(page.locator('text=Migration Strategy')).toBeVisible();
  await expect(page.locator('text=Your existing components work perfectly')).toBeVisible();
  await expect(page.locator('text=Use shadcn for new features')).toBeVisible();
});