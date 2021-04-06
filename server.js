const express = require('express');
const app = express();
const flashScoreRouter = require('./src/routes/flashscore-scraper.route')

app.use('/scraper', flashScoreRouter);

app.listen(3000, () => console.log(`App started on port 3000.`));
