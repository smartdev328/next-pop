const path = require('path');
const fs = require('fs');
const { createHash } = require('crypto');
const chromium = require('@sparticuz/chromium');
const { executablePath } = require('puppeteer');
const puppeteer = require('puppeteer-core');

export async function generateOgImage(props) {
  const params = new URLSearchParams(props);
  const url = `file:${path.join(
    process.cwd(),
    // `src/pages/articles/og-image.html?${params}`
    `build/articles/og-image.html?${params}`
  )}`;
  //  nconsole.log("rr ---"+url)

  const hash = createHash('md5').update(url).digest('hex');
  const ogImageDir = path.join(process.cwd(), `public/og`);
  const imageName = `${hash}.png`;
  const imagePath = `${ogImageDir}/${imageName}`;
  const publicPath = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/og/${imageName}`;

  try {
    fs.statSync(imagePath);
    return publicPath;
  } catch (error) {
    // file does not exists, so we create it
  }

  const browser = await puppeteer.launch({     
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.goto(url, { waitUntil: 'load' });
  const buffer = await page.screenshot();
  await browser.close();

  // res.status(200).json({ success: true });

  fs.mkdirSync(ogImageDir, { recursive: true });
  fs.writeFileSync(imagePath, buffer);

  return publicPath;
}
