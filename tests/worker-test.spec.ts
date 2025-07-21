import { test, expect } from '@playwright/test';

test('Check Cloudflare Worker deployment', async ({ page }) => {
  // Try to access the Worker
  const response = await page.goto('https://megan-admin-dashboard.megan-d14.workers.dev', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  
  console.log('Response status:', response?.status());
  
  // Take a screenshot
  await page.screenshot({ path: 'worker-status.png', fullPage: true });
  
  // Try the CSV import page
  await page.goto('https://megan-admin-dashboard.megan-d14.workers.dev/csv-import');
  await page.screenshot({ path: 'worker-csv-import.png', fullPage: true });
});