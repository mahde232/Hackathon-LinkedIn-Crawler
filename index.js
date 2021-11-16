const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');


const GetDataFromSpecificProfile = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });          //! when running puppeteer in heroku/AWS or similar, headless shoud be set tp true
    const page = await browser.newPage();

    await page.goto("https://www.linkedin.com/uas/login")
    await page.type('#username', 'jebigom876@idrct.com');
    await page.type('#password', 'asdfg12345');
    await page.waitForSelector('.btn__primary--large');
    await page.click('.btn__primary--large');
    await page.waitFor(3000);
    await page.goto('https://www.linkedin.com/in/shadi-masood-b1571a226/');;
    //get all page html so we can scrape it using cheerio
    let data = await page.evaluate(() => document.querySelector('*').outerHTML); 
    let $ = cheerio.load(data)
    //grab name
    const personName = $('.text-heading-xlarge').text().trim();
    console.log('personName=',personName);
    //grab location
    $('.pb2.pv-text-details__left-panel').each((i,element)=>{
        const location = $(element).find('.text-body-small.inline.t-black--light.break-words').text().trim();
        console.log('location=',location);
    })
    //go to email page
    await page.goto('https://www.linkedin.com/in/shadi-masood-b1571a226/detail/contact-info/')
    data = await page.evaluate(() => document.querySelector('*').outerHTML); //get all page html so we can scrape it using cheerio
    $ = cheerio.load(data)
    let email = '';
    let profileLink = '';
    $('.pv-contact-info__contact-link.link-without-visited-state.t-14').each((i,element)=> {
        if(i === 0)
            profileLink = $(element).text().trim();
        if(i === 1)
            email = $(element).text().trim();
    })
    console.log('email=',email);
    console.log('profileLink=',profileLink);
    console.log('');
    console.log('Done scraping page');
    console.log('---------------');
    return {
        name: personName,
        location: location,
        email: email,
        profileLink: profileLink
    }
}




async function googleSearchProfiles(howManyPages) {
    const profiles = [];
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 850, height: 1080 }
    });          //! when running puppeteer in heroku/AWS or similar, headless shoud be set tp true
    const page = await browser.newPage();
    await page.goto("https://www.google.com/search?q=linkedIn+Israeli+stealth+startup");
    for (let i = 1; i <= howManyPages; i++) {
        let data = await page.evaluate(() => document.querySelector('*').outerHTML); //get all page html so we can scrape it using cheerio
        let $ = cheerio.load(data)
        $('.yuRUbf').each((i, element) => {
            const profileUrl = $(element).find('a').attr('href');
            if (profileUrl.substring(24).split('/')[0] === 'in')
                profiles.push({ profile: profileUrl });
        });
        await page.goto(`https://www.google.com/search?q=linkedIn+Israeli+stealth+startup&start=${i * 10}`);
    }

    fs.writeFileSync('./profiles.json', JSON.stringify({ profiles: profiles }));
    let file = JSON.parse(fs.readFileSync('profiles.json'));
    console.log(file.profiles);
    return profiles;
}

googleSearchProfiles(2);
GetDataFromSpecificProfile();