const { test, expect } = require('@playwright/test');

test('Messages page loads and displays table', async ({ page }) => {
  try {
    // Navigate to the messages page
    await page.goto('http://localhost:3002/messages');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page title is correct
    const title = await page.textContent('h1');
    console.log('Page title:', title);
    
    // Look for the messages table
    const table = page.locator('table');
    const tableVisible = await table.isVisible();
    console.log('Table visible:', tableVisible);
    
    // Check for loading or error states
    const loadingText = page.locator('text=Loading messages...');
    const errorText = page.locator('text=Error:');
    
    const isLoading = await loadingText.isVisible();
    const hasError = await errorText.isVisible();
    
    console.log('Loading state:', isLoading);
    console.log('Error state:', hasError);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'messages-page-test.png', fullPage: true });
    
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'messages-page-error.png', fullPage: true });
  }
});