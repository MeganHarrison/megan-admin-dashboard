import { test, expect } from '@playwright/test';

test.describe('Insights Page', () => {
  test('should load insights page and display chat interface', async ({ page }) => {
    // Navigate to insights page
    await page.goto('http://localhost:3000/insights');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page breadcrumb is visible
    await expect(page.locator('h2:has-text("Relationship Insights")')).toBeVisible();
    
    // Check if AI Relationship Analyst title is visible
    await expect(page.locator('text=AI Relationship Analyst')).toBeVisible();
    
    // Check if input field is visible
    await expect(page.locator('input[placeholder*="Ask about your relationship"]')).toBeVisible();
    
    // Check if suggested questions are visible
    await expect(page.locator('text=Suggested Questions')).toBeVisible();
    await expect(page.locator('text=How have our communication patterns changed over time?')).toBeVisible();
    
    // Check if analysis stats are visible
    await expect(page.locator('text=Analysis Stats')).toBeVisible();
    await expect(page.locator('text=Vectorized Chunks')).toBeVisible();
  });

  test('should allow user to ask a question and receive response', async ({ page }) => {
    await page.goto('http://localhost:3000/insights');
    await page.waitForLoadState('networkidle');
    
    // Type a question
    const inputField = page.locator('input[placeholder*="Ask about your relationship"]');
    await inputField.fill('How do we resolve conflicts?');
    
    // Submit the question
    await page.locator('button[type="submit"]').click();
    
    // Wait for response to appear
    await expect(page.locator('text=How do we resolve conflicts?')).toBeVisible();
    
    // Check if loading message appears
    await expect(page.locator('text=Analyzing your relationship data...')).toBeVisible();
    
    // Wait for actual response (up to 10 seconds)
    await page.waitForSelector('text=Conflict Resolution Analysis', { timeout: 10000 });
    
    // Verify response contains expected content
    await expect(page.locator('text=Conflict Resolution Analysis')).toBeVisible();
  });

  test('should allow clicking suggested questions', async ({ page }) => {
    await page.goto('http://localhost:3000/insights');
    await page.waitForLoadState('networkidle');
    
    // Click on a suggested question
    await page.locator('text=How have our communication patterns changed over time?').click();
    
    // Verify the question appears in chat (in a message bubble)
    await expect(page.locator('.bg-blue-500:has-text("How have our communication patterns changed over time?")')).toBeVisible();
    
    // Wait for response
    await page.waitForSelector('text=Communication Pattern Analysis', { timeout: 10000 });
    await expect(page.locator('text=Communication Pattern Analysis')).toBeVisible();
  });
});