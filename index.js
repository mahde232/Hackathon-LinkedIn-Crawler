const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const request = require('request')


async function main (){

    const browser = await puppeteer.launch({headless : false,
    defaultViewport:{width : 1920, height: 1080}});          //! when running puppeteer in heroku/AWS or similar, headless shoud be set tp true
const page = await browser.newPage();

await page.goto("https://www.linkedin.com/uas/login")
await page.type('#username','kesaxo2766@incoware.com');
await page.type('#password','123456mahdeshadi');
await page.click('.btn__primary--large.from__button--floating');
setTimeout( async ()=>{
    await page.goto('https://www.linkedin.com/in/amir-torgeman-32566b226/')
    
    request('https://www.linkedin.com/in/amir-torgeman-32566b226/', (err, res , html)=>{
           if(!err && res.statusCode === 200  ){
               const $ = cheerio.load(html)
               $('.text-body-small').each((i,element)=>{
                    // const text = $(element).find('.text-body-small').text;

                    console.log('element.text');
               })
           }
    })
},5000)
}

main();


// class="text-body-small inline t-black--light break-words" mahde lol123

// text-heading-xlarge inline t-24 v-align-middle break-words