const { chromium } = require('playwright');

async function debug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to messages page...');
    await page.goto('http://localhost:3001/messages');
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log('Page title:', title);
    
    const content = await page.content();
    console.log('Page contains "Messages":', content.includes('Messages'));
    console.log('Page contains "404":', content.includes('404'));
    console.log('Page contains "error":', content.includes('error'));
    
    await page.screenshot({ path: 'messages-debug.png', fullPage: true });
    console.log('Screenshot saved as messages-debug.png');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debug();