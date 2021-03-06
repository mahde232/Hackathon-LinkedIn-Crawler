const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const mongoose = require("mongoose");
let converter = require('json-2-csv');
const profileModel = require("./models/profiles.model").profilesModel;
//puppeteer params
const loginToLinkedInFakeAccount = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
    }); //! when running puppeteer in heroku/AWS or similar, headless shoud be set tp true
    const page = await browser.newPage();
    await page.goto("https://www.linkedin.com/uas/login");
    await page.type("#username", "dibewa@thichanthit.com");
    await page.type("#password", "shakky17");
    await page.waitForSelector(".btn__primary--large");
    await page.click(".btn__primary--large");
    await page.waitFor(15000);

    const resultsFromLinkedIn = await linkedInSearchProfiles(page, 2);
    console.log("From Shadi Function=", resultsFromLinkedIn);
    const resultsFromGoogle = await googleSearchProfiles(page, 3);
    console.log("From Saleh Function=", resultsFromGoogle);

    let arrayOfResult = [];
    console.log('Google Phase:');
    for (const profileLink of resultsFromGoogle) {
        console.log(`Crawling Link=${profileLink}`);
        const dataResultObj = await GetDataFromSpecificProfile(page, profileLink);
        console.log("dataResultObj=", dataResultObj);
        arrayOfResult.push(dataResultObj);
    }
    console.log('linkedIn Phase:');
    for (const profileLink of resultsFromLinkedIn) {
        console.log(`Crawling Link=${profileLink}`);
        const dataResultObj = await GetDataFromSpecificProfile(page, profileLink);
        console.log("dataResultObj=", dataResultObj);
        arrayOfResult.push(dataResultObj);
    }
    console.log("arrayOfResult", arrayOfResult);
    fs.writeFileSync("./results.json", JSON.stringify(arrayOfResult));
    //Save arrayOfResults to the DB using InsertMany (could be a function, could be in this code)
    profileModel
        .insertMany(arrayOfResult)
        .then(() => {
            console.log("Inserted to DB");
        })
        .catch((err) => {
            console.log("error=", err);
        });
    const csv = await converter.json2csvAsync(arrayOfResult);
    fs.writeFileSync("./results.csv", csv);
};

const GetDataFromSpecificProfile = async (page, profile) => {
    await page.goto(`${profile}`, { waitUntil: "networkidle2" });
    //get all page html so we can scrape it using cheerio
    await page.waitForSelector(
        ".pb2.pv-text-details__left-panel a.link-without-visited-state"
    );
    await page.click(
        ".pb2.pv-text-details__left-panel a.link-without-visited-state"
    );

    const puppeteerData = await page.evaluate(() => {
        const personName = document
            .querySelector(".text-heading-xlarge")
            .innerText.trim();
        const location = document
            .querySelector(".pb2.pv-text-details__left-panel .text-body-small")
            .innerText.trim();
        // const email = document.querySelector('.pv-contact-info__ci-container a').innerText; //THIS SHIT DOESNT WORK, ASK FOR HELP
        return {
            name: personName || "name-not-found",
            location: location || "location-not-found",
            // email: email || 'no-public-email-available',
        };
    });
    puppeteerData['profileLink'] = profile;
    return puppeteerData;
};

//Shadi
const linkedInSearchProfiles = async (page, howManyPages) => {
    let linksArray = [];
    const titles = ["ceo", "cto", "co-founder"];
    let searchQueryURL =
        "https://www.linkedin.com/search/results/people/?geoUrn=%5B%22101620260%22%5D&keywords=stealth%20startup";
    for (let i = 1; i <= howManyPages; i++) {
        console.log(`${searchQueryURL}&title=${titles[0]}`);
        await page.goto(`${searchQueryURL}&title=${titles[0]}`);
        let htmlContent = await page.content();
        let $ = cheerio.load(htmlContent);
        let newLinksToVisit = $(".app-aware-link")
            .map((index, element) => $(element).attr("href"))
            .get(); //get links to profiles from search
        linksArray = [...linksArray, ...newLinksToVisit];

        console.log(`${searchQueryURL}&title=${titles[1]}`);
        await page.goto(`${searchQueryURL}&title=${titles[1]}`);
        htmlContent = await page.content();
        $ = cheerio.load(htmlContent);
        newLinksToVisit = $(".app-aware-link")
            .map((index, element) => $(element).attr("href"))
            .get(); //get links to profiles from search
        linksArray = [...linksArray, ...newLinksToVisit];

        console.log(`${searchQueryURL}&title=${titles[2]}`);
        await page.goto(`${searchQueryURL}&title=${titles[2]}`);
        htmlContent = await page.content();
        $ = cheerio.load(htmlContent);
        newLinksToVisit = $(".app-aware-link")
            .map((index, element) => $(element).attr("href"))
            .get(); //get links to profiles from search
        linksArray = [...linksArray, ...newLinksToVisit];

        searchQueryURL = `${searchQueryURL}&page=${i + 1}`;
        await page.goto(`${searchQueryURL}`);
    }
    const uniq = [...new Set(linksArray)];
    const filteredData = uniq.filter((ele) => {
        if (ele.substring('https://www.linkedin.com/'.length).split("/")[0] === "in") return true;
        else return false;
        
    });
    fs.writeFileSync("./linkedInProfiles.json", JSON.stringify(filteredData));
    return filteredData;
};

//Saleh
const googleSearchProfiles = async (page, howManyPages) => {
    const profiles = [];
    await page.goto(
        "https://www.google.com/search?q=linkedIn+Israeli+stealth+startup+ceo+cto+co-founder"
    );
    for (let i = 1; i <= howManyPages; i++) {
        let data = await page.evaluate(() => document.querySelector("*").outerHTML); //get all page html so we can scrape it using cheerio
        let $ = cheerio.load(data);
        $(".yuRUbf").each((i, element) => {
            const profileUrl = $(element).find("a").attr("href");
            if (profileUrl.substring(24).split("/")[0] === "in")
                profiles.push(profileUrl);
        });
        await page.goto(
            `https://www.google.com/search?q=linkedIn+Israeli+stealth+startup+ceo+cto+co-founder&start=${i * 10
            }`
        );
    }

    fs.writeFileSync("./googleProfiles.json", JSON.stringify(profiles));
    return profiles;
};

loginToLinkedInFakeAccount();

mongoose.connect(
    "mongodb+srv://mahde:asdfg12345@cluster0.tdz2o.mongodb.net/LinkedInDB?retryWrites=true&w=majority",
    { useNewUrlParser: true },
    () => {
        console.log("connected to db");
    }
);
