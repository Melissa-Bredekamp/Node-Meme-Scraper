// 1. packages
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

// 2. Creat folder
const memeFolder = './memes';

if (fs.existsSync(memeFolder)) {
  console.log('meme folder exists');
} else {
  fs.mkdir('./memes', function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('New directory successfully created.');
    }
  });
}

async function downloadSingleImage(imageSrc) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.on('response', async (response) => {
    // console.log('page response', response.status());
    if (response.status() === 200) {
      response.buffer().then((fileBuffer) => {
        const url = response.url();
        const urlFilePath = new URL(url).pathname;
        const fileName = urlFilePath.split('/').pop();
        const filePath = path.resolve(__dirname, 'memes', fileName);
        const writeStream = fs.createWriteStream(filePath);
        writeStream.write(fileBuffer);
      });
    }
  });
  await page.goto(imageSrc);
  await browser.close();
}

downloadSingleImage(
  'https://memegen.link/tenguy/your_text/goes_here.jpg?preview=true&watermark=none',
);

async function identifyImageSrces() {
  console.log('start fetching images...');
  const url = 'https://memegen.link/examples';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  const imageSrces = await page.evaluate(() => {
    const imageTags = document.querySelectorAll('.meme-templates .meme-img');

    const imageCount = Math.min(imageTags.length, 10);
    const imageSrces = [];
    for (let i = 0; i < imageCount; i++) {
      imageSrces.push(imageTags[i].src);
    }
    return imageSrces;
  });
  await browser.close();

  // console.log('imageSrces', imageSrces);

  for (let i = 0; i < imageSrces.length; i++) {
    await downloadSingleImage(imageSrces[i]);
  }
  console.log('finished loading', imageSrces.length, 'images');
}

identifyImageSrces();
