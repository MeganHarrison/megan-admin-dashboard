import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

test('Test CSV import through UI on local dev', async ({ page }) => {
  // Create test CSV
  const csvContent = `name,email,phone
"UI Test User","uitest@example.com","555-9999"`;
  
  const testFilePath = join(process.cwd(), 'ui-test.csv');
  writeFileSync(testFilePath, csvContent);
  
  // Navigate to local CSV import page
  await page.goto('http://localhost:3000/csv-import');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testFilePath);
  
  // Click import button
  const importButton = page.locator('button:has-text("Import CSV to Database")');
  await importButton.click();
  
  // Wait for response
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'csv-ui-result.png' });
  
  // Check for success or error message
  const pageContent = await page.content();
  console.log('Result:', pageContent.includes('Success') ? 'Success' : 'Error');
  
  // Clean up
  const fs = require('fs');
  fs.unlinkSync(testFilePath);
});