const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer test...");
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log("Browser launched successfully!");
        const version = await browser.version();
        console.log("Browser version:", version);
        await browser.close();
        console.log("Browser closed.");
    } catch (err) {
        console.error("Puppeteer launch failed:", err);
    }
})();
