import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

test('CSV import page loads and accepts file upload', async ({ page }) => {
  // Create a test CSV file
  const csvContent = `name,email,phone
"John Doe","john@example.com","555-0123"
"Jane Smith","jane@example.com","555-0124"
"Bob Wilson","bob@example.com","555-0125"`;
  
  const testFilePath = join(process.cwd(), 'test-data.csv');
  writeFileSync(testFilePath, csvContent);
  
  // Navigate to the CSV import page
  await page.goto('http://localhost:3002/csv-import');
  
  // Check that the page loaded
  await expect(page.locator('h1')).toHaveText('CSV Import to D1 Database');
  
  // Check for the file input
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toBeVisible();
  
  // Upload the test file
  await fileInput.setInputFiles(testFilePath);
  
  // Verify file was selected
  await expect(page.locator('text=Selected file: test-data.csv')).toBeVisible();
  
  // Check that the import button is enabled
  const importButton = page.locator('button:has-text("Import CSV to Database")');
  await expect(importButton).toBeEnabled();
  
  // Click the import button
  await importButton.click();
  
  // Wait for the loading state
  await expect(page.locator('button:has-text("Importing...")')).toBeVisible();
  
  // Wait for response (in local dev, it will parse but not insert)
  await page.waitForResponse(response => 
    response.url().includes('/api/csv-import') && response.status() === 200
  );
  
  // Check for success message
  const successMessage = page.locator('.bg-green-50').last();
  await expect(successMessage).toBeVisible();
  await expect(successMessage).toContainText('Success!');
  
  // Clean up test file
  const fs = require('fs');
  fs.unlinkSync(testFilePath);
});