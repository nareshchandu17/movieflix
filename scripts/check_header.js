const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  const navStyle = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    if (!nav) return 'No nav found';
    const style = window.getComputedStyle(nav);
    const rect = nav.getBoundingClientRect();
    return {
      classes: nav.className,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      transform: style.transform,
      zIndex: style.zIndex,
      top: style.top,
      left: style.left,
      width: style.width,
      height: style.height,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      }
    };
  });
  
  console.log(JSON.stringify(navStyle, null, 2));
  await browser.close();
})();
