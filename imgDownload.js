'use strict';

const puppeteer = require('puppeteer');
const request = require('request');
const fs = require('fs');

function download(uri, filename) {
  return new Promise((resolve, reject) => {
    request.head(uri, function (err, res, body) {
      request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);
    });
  });
}

async function getPageImg(page) {
  return await page.evaluate(async () => {
    let imgList = []
    const imgAll = document.querySelectorAll('img')
    await new Promise((resolve, reject) => {
      for(let idx = 0; idx < imgAll.length; idx++) {
        const item = imgAll[idx]
        if(item.width > 100 && item.width > 100 && !!item.src) {
          const url = item.src.replace(/[\#\?].*$/,'')
          imgList.push({
            url: item.src,
            file_name: url.substring(url.lastIndexOf('/')+1)
          })
        }
      }
      resolve() 
    })
    return imgList
  })
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto('https://www.pexels.com/zh-tw/search/%E9%A2%A8%E6%99%AF/')

  const imgList = await getPageImg(page)
  for(let idx = 0; idx < imgList.length; idx++){
    const item = imgList[idx]
    await page.goto(item.url);
    await download(item.url, `./download/${item.file_name}`);
  }

  await browser.close();
})();
