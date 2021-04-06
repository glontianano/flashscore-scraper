const cheerio = require('cheerio');
const puppeteer = require('puppeteer');


exports.getMatchResults = async function (url) {
    try {
        async function getPage(url) {
            const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();
            await page.goto(url, {waitUntil: 'networkidle0'});

            const html = await page.content();
            await browser.close();
            return html;
        }

        const html = await getPage(url);
        const $ = cheerio.load(html);

        let results = [];
        $('.event__match').each(function(i, element){
            if( i <= 14) {
                const eventTime = $(this).children('.event__time').text();
                const participantHome = $(this).children('.event__participant--home').text();
                const participantAway = $(this).children('.event__participant--away').text();
                const score = $(this).children('.event__scores').text();
                results.push({
                    time: eventTime,
                    team1: participantHome,
                    team2: participantAway,
                    score: score
                });
            }

        });
        return results;
    } catch (e) {
        // Log Errors
        throw Error('Error while Scraping flashscore.com')
    }
}