const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to standard desktop size
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    console.log('Navigating to http://localhost:3000/');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    // Wait an extra 2 seconds for any animations or data fetches
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'dashboard_screenshot.png', fullPage: true });
    
    console.log('Screenshot saved to dashboard_screenshot.png');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
