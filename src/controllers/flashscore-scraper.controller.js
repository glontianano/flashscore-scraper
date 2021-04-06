const flashScoreService = require('../services/flashscore-scraper.services')
require('dotenv').config()

exports.getGameResults = async function (req, res) {
    try {
        const url = process.env.DYNAMIC_SITE_URL;
        const resultObj = await flashScoreService.getMatchResults(url)

        return res.status(200).json({ status: 200, data: resultObj, message: "success" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}