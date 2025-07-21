import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

test('CSV import with live Cloudflare Worker', async ({ page }) => {
  // Create a test CSV file
  const csvContent = `name,email,phone
"Test User 1","test1@example.com","555-1111"
"Test User 2","test2@example.com","555-2222"
"Test User 3","test3@example.com","555-3333"`;
  
  const testFilePath = join(process.cwd(), 'live-test-data.csv');
  writeFileSync(testFilePath, csvContent);
  
  // Navigate to the CSV import page
  await page.goto('http://localhost:3000/csv-import');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Upload the test file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testFilePath);
  
  // Wait for file to be selected
  await expect(page.locator('text=Selected file: live-test-data.csv')).toBeVisible();
  
  // Click the import button
  const importButton = page.locator('button:has-text("Import CSV to Database")');
  await importButton.click();
  
  // Wait for the worker response (this will actually hit the Cloudflare D1 database)
  await page.waitForResponse(response => 
    response.url().includes('csv-import-worker') && response.status() === 200,
    { timeout: 30000 }
  );
  
  // Check for success message
  const successMessage = page.locator('.bg-green-50').last();
  await expect(successMessage).toBeVisible({ timeout: 10000 });
  await expect(successMessage).toContainText('Success!');
  await expect(successMessage).toContainText('Imported 3 rows to the texts-bc table');
  
  // Take a screenshot of the success
  await page.screenshot({ path: 'csv-import-success-live.png' });
  
  // Clean up test file
  const fs = require('fs');
  fs.unlinkSync(testFilePath);
});