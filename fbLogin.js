require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false, // 是否開啟瀏覽器運行
    args: ["--disable-notifications"], // 關閉瀏覽器通知彈出窗口
  })
  
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(1000000) // 最多等待時間，一般默認為30秒
  await page.setViewport({ width: 1200, height: 600 })
  // 開啟 facebook 頁面，並登入
  await page.goto('https://www.facebook.com')
  await page.waitForSelector('#email')
  await page.type('#email', process.env.FB_EMAIL)
  await page.type('#pass', process.env.FB_PWD)
  await page.click(`[type="submit"]`)

  // do something...

  await browser.close()
})()

