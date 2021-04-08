const cheerio = require('cheerio');
const puppeteer = require('puppeteer');


exports.getMatchResults = async function (url) {
    try {
        const html = await getPage(url);
        const $ = cheerio.load(html);

        const results = [];
        const elementIds = [];
        let lastElem = 0;
        $('.event__match').each(function(i, element) {
            if (lastElem < 1) {
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
                if ($(this).hasClass('event__match--last')) {
                    lastElem++;
                }
                elementIds.push($(this).attr('id').slice(4));
            }
        });


        // Collect additional info such as goals, yellow cards and substitutions.
        const dataSet = {};
        for (let i = 0; i < elementIds.length; i++) {
            const yellowCardsArray = [];
            const substitutionsArray = [];
            const goalsArray = [];
            const url = `https://www.flashscore.com/match/${elementIds[i]}/#match-summary`;
            const html = await getPage(url);
            const $ = cheerio.load(html);
            $('.detailMS__incidentRow').each(function (index, element) {
                // Determine team name.
                let team = $('.tname-home').children().children().children('.participant-imglink').text();
                let time = $(this).children('.time-box').text();

                if ($(this).hasClass('incidentRow--away')) {
                    team = $('.tname-away').children().children().children('.participant-imglink').text();
                }

                if ($(this).children().hasClass('time-box-wide')) {
                    time = $(this).children('.time-box-wide').text();
                }


                // Yellow cards basket.
                if ($(this).children().hasClass('y-card')) {
                    const player = $(this).children('.participant-name').text();
                    yellowCardsArray.push({
                        player: player,
                        time : time,
                        team: team,
                    })
                }
                // Substitution basket.
                if ($(this).children().hasClass('substitution-in')) {
                    const playerIn = $(this).children('.substitution-in-name').text();
                    const playerOut = $(this).children('.substitution-out-name').text();
                    substitutionsArray.push({
                        playerIn: playerIn,
                        playerOut: playerOut,
                        time: time,
                        team: team,
                    })
                }
                // Goal basket.
                if ($(this).children().hasClass('soccer-ball')) {
                    const author = $(this).children('.participant-name').text();
                    goalsArray.push({
                        author: author,
                        time: time,
                        team: team,
                    })
                }

            })
            dataSet[i] = {
                goals: goalsArray,
                yellowCardsArray: yellowCardsArray,
                substitutionsArray: substitutionsArray,
            }
        }

        // Map score results with addition info and return object.
        return  results.map(function(value, index) {
            value.additionalInfo = dataSet[index];

            return value;
        })

    }
    catch (e) {
        throw Error('Error while Scraping flashscore.com')
    }
}

async function getPage(url) {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle0'});

    const html = await page.content();
    await browser.close();
    return html;
}