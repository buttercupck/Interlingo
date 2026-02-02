import { chromium } from 'playwright';

async function captureJobsBoard() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Navigating to Jobs Board...');
  await page.goto('http://localhost:3001/dashboard/jobs');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  console.log('Taking screenshot...');
  await page.screenshot({
    path: '/tmp/jobs-board-full.png',
    fullPage: true
  });

  console.log('Screenshot saved to /tmp/jobs-board-full.png');

  // Also check a job detail page if there are jobs
  const jobLinks = await page.locator('a:has-text("View")').count();
  if (jobLinks > 0) {
    console.log('Opening first job detail page...');
    await page.locator('a:has-text("View")').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: '/tmp/job-detail-full.png',
      fullPage: true
    });
    console.log('Job detail screenshot saved to /tmp/job-detail-full.png');
  }

  await browser.close();
}

captureJobsBoard().catch(console.error);
