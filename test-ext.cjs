const puppeteer = require('puppeteer');
const path = require('path');
const fileUrl = 'file://' + path.resolve('dist/index.html');

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    await page.evaluateOnNewDocument(() => {
        window.chrome = window.chrome || {};
        window.chrome.storage = {
            local: {
                get: async () => ({}),
                set: async () => { },
                remove: async () => { }
            }
        };
    });

    await page.goto(fileUrl, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.milkdown .editor', { timeout: 10000 });

    console.log("Typing '/h'...");
    await page.click('.milkdown .editor');
    await page.keyboard.type('/h');

    await new Promise(r => setTimeout(r, 1000));

    const menuHtml = await page.evaluate(() => {
        const menu = document.querySelector('.slash-menu');
        if (!menu) return null;
        return {
            show: menu.dataset.show,
            display: window.getComputedStyle(menu).display,
            innerHTML: menu.innerHTML
        };
    });

    console.log('Menu State:', menuHtml);
    await browser.close();
})();
