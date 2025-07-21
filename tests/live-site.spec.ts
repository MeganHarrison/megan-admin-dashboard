import { test, expect } from '@playwright/test';

test('Check live Cloudflare Pages deployment', async ({ page }) => {
  // Try to access the live site
  const response = await page.goto('https://megan-admin-dashboard.pages.dev', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  
  console.log('Response status:', response?.status());
  
  // Take a screenshot regardless of status
  await page.screenshot({ path: 'cloudflare-pages-status.png', fullPage: true });
  
  // Get page content
  const content = await page.content();
  console.log('Page content preview:', content.substring(0, 500));
});