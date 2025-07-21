import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

test('Test CSV import with correct schema', async ({ page }) => {
  // Navigate to CSV import page
  await page.goto('http://localhost:3000/csv-import');
  
  // Upload file with correct schema
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(join(process.cwd(), 'test-correct-schema.csv'));
  
  // Click import
  const importButton = page.locator('button:has-text("Import CSV to Database")');
  await importButton.click();
  
  // Wait for response
  await page.waitForTimeout(3000);
  
  // Check result
  const pageContent = await page.content();
  const hasSuccess = pageContent.includes('Success');
  const hasError = pageContent.includes('Failed');
  
  console.log('Result:', hasSuccess ? 'Success' : hasError ? 'Error' : 'Unknown');
  
  // Take screenshot
  await page.screenshot({ path: 'correct-schema-result.png' });
  
  // If error, get the message
  if (hasError) {
    const errorMessage = await page.locator('.bg-red-50').textContent();
    console.log('Error message:', errorMessage);
  }
});