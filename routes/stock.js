const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Stock = require("../models/Stock");

const { isLoggedOut } = require("../middleware/route-guard");

router.get("/:stockId", isLoggedOut, (req, res, next) => {
  const stockId = req.params.stockId;
  const stockRef = [];
  Stock.findById(stockId)
    .then((stock) => {
      axios
        .get(
          `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stock.ticker}&apikey=${process.env.API_KEY}`
        )
        .then((overview) => {
          stockRef.push(`${overview.data.Exchange}:${overview.data.Symbol}`);
          stockRef.push(overview.data);
        })
        .then(() => {
          axios
            .get(
              `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${stock.ticker}&sort=LATEST&apikey=${process.env.API_KEY}`
            )
            .then((stockNews) => {
              stockRef.push(stockNews.data.feed);
              res.render("stocks/stock.hbs", stockRef);
            });
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
