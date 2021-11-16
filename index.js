const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios')


async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });          //! when running puppeteer in heroku/AWS or similar, headless shoud be set tp true
    const page = await browser.newPage();

    await page.goto("https://www.linkedin.com/uas/login")
    await page.type('#username', 'kesaxo2766@incoware.com');
    await page.type('#password', '123456mahdeshadi');
    await page.waitForSelector('.btn__primary--large');
    await page.click('.btn__primary--large');
    await page.waitFor(3000);
    await page.goto('https://www.linkedin.com/in/amir-torgeman-32566b226/');
    await page.waitForSelector('.pb2, .pv-text-details__separator, .link-without-visited-state');
    await page.click('.pb2, .pv-text-details__separator, .link-without-visited-state');

    // let data = await page.evaluate(() => document.querySelector('*').outerHTML); //get all page html so we can scrape it using cheerio
    // let $ = cheerio.load(data)
    // const personName = $('.text-heading-xlarge').text();
    // const personNameFromH1 = $('h1').text();
    // console.log('personName=',personName);
    // console.log('personNameFromH1=',personNameFromH1);



    // $('.pb2').each((i,element)=>{
    //     const location = $(element).find('.text-body-small').text();
    //     console.log('location=',location);
    // })

    //class="pv-contact-info__contact-type ci-email"
    // $('.pv-contact-info__contact-type .ci-email, li-icon').next().next().find('a').each((i,element)=>{
    //     console.log('element index=',i);
    //     const emailTagText = $(element).find('a').text() //class="pv-contact-info__contact-link link-without-visited-state t-14"
    //     const emailTagHref = $(element).find('a').attr('href');
    //     console.log('emailTagText',emailTagText);
    //     console.log('emailTagHref',emailTagHref);
    // })

    console.log('Done scraping page');
    // await browser.close();
}

main();