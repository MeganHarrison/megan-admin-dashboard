import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

test('Debug CSV import error', async ({ page }) => {
  // Listen for console messages
  const messages: any[] = [];
  page.on('console', msg => {
    messages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // Listen for network responses
  page.on('response', response => {
    if (response.url().includes('csv-import')) {
      console.log('Response URL:', response.url());
      console.log('Response Status:', response.status());
    }
  });

  // Create a simple CSV
  const csvContent = `column1,column2,column3
"value1","value2","value3"
"test1","test2","test3"`;
  
  const testFilePath = join(process.cwd(), 'debug.csv');
  writeFileSync(testFilePath, csvContent);
  
  // Navigate to CSV import page
  await page.goto('http://localhost:3000/csv-import');
  
  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testFilePath);
  
  // Click import
  const importButton = page.locator('button:has-text("Import CSV to Database")');
  await importButton.click();
  
  // Wait for response
  await page.waitForTimeout(5000);
  
  // Get response text
  const errorMessage = await page.locator('.bg-red-50').textContent();
  console.log('Error message:', errorMessage);
  
  // Get response details from network
  page.on('response', async response => {
    if (response.url().includes('csv-import')) {
      const body = await response.text();
      console.log('Response body:', body);
    }
  });
  
  // Take screenshot
  await page.screenshot({ path: 'csv-error-debug.png' });
  
  // Log console messages
  console.log('Console messages:', messages);
  
  // Clean up
  const fs = require('fs');
  fs.unlinkSync(testFilePath);
});