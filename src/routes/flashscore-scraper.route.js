const express = require('express')
const router = express.Router()
const flashScoreController = require('../controllers/flashscore-scraper.controller');

router.get('/world-cup-scores', flashScoreController.getGameResults);

router.get('/', (req, res) => {
    res.send('hello')
})

module.exports = router