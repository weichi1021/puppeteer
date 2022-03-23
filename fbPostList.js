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
  // 等待頁面跳轉
  await page.waitForNavigation() 
  console.log('facebook logged in')
  // 導向 hashtag 頁面
  await page.goto(`https://www.facebook.com/hashtag/${encodeURIComponent(process.env.FB_HASHTAG)}`)
  //  取得 facebook 貼文資料
  const data = await getPageData(page)

  await browser.close()
})()

async function getPageData(page) {
  return await page.evaluate(async () => {
    let data = []
    let postList = [];
    let scrollHeight = document.querySelector('html, body').scrollHeight
    let totalHeight = 0
    let distance = 500
    var timer;

    await new Promise((resolve, reject) => {
      timer = setInterval(() => {
        scrollHeight = document.querySelector('html, body').scrollHeight
        document.querySelector('html, body').scrollTo(0, distance)

        // 貼文列表
        postList = document.querySelectorAll('div.du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0')
        for(let idx = data.length; idx < postList.length; idx++) {
          const postEl = postList[idx]
          // 取得名字
          const postName = postEl.getElementsByTagName('strong')[0].textContent
          // // 取得大頭照
          const postAvatar = postEl.getElementsByTagName('image')[0].getAttribute('xlink:href')
          // // 點擊顯示更多
          const postTextEl = postEl.getElementsByClassName('ecm0bbzt hv4rvrfc ihqw7lf3 dati1w0a')[0]
          const moreBtnEl = postTextEl.getElementsByClassName('oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl gpro0wi8 oo9gr5id lrazzd5p')[0]
          if(postTextEl.getInnerHTML().indexOf('顯示更多') !== -1) moreBtnEl.click()
          // 取得內容
          const postInnerHtml = postTextEl.getElementsByClassName('kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x c1et5uql ii04i59q')[0].innerHTML
          // 取得照片
          const postImgList = []
          const imgGroup = postEl.getElementsByClassName('i09qtzwb n7fi1qx3 datstx6m pmk7jnqg j9ispegn kr520xx4 k4urcfbm')
          for (let imgIdx = 0; imgIdx < imgGroup.length; imgIdx++) {
            postImgList.push(imgGroup[imgIdx].getAttribute('src'))
          }
          // 塞入資料
          data.push({
            name: postName,
            avatar: postAvatar,
            html: postInnerHtml,
            img: postImgList
          })
        }

        totalHeight += distance 
        if(totalHeight >= scrollHeight){
          clearInterval(timer)
          resolve()
        }
      }, 500)
    })
    return data
  })
}

