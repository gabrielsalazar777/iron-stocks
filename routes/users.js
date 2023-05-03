const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Stock = require("../models/Stock");

const { isLoggedOut, isOwner } = require("../middleware/route-guard");

// get dashboard
router.get("/dashboard", isLoggedOut, (req, res, next) => {
  // if (req.session.user) {
  User.findById(req.session.user._id)
    .populate("portfolios")
    .then((user) => {
      res.render("users/user-dashboard.hbs", user);
    })
    .catch((err) => {
      console.log(err);
    });
  // } else {
  //   res.redirect("/auth/login");
  // }
});

// add portfolio
router.post("/dashboard", isLoggedOut, (req, res, next) => {
  // console.log('Req body: ', req.body);
  const { name } = req.body;
  // console.log("Req body name: ", name);
  Portfolio.create({ name })
    .then((newPortfolio) => {
      User.findByIdAndUpdate(
        req.session.user._id,
        {
          $push: { portfolios: newPortfolio._id },
        },
        { new: true }
      ).then(() => {
        res.redirect("/users/dashboard");
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// get portfolio
router.get(
  "/portfolio/:portfolioId",
  isLoggedOut,
  isOwner,
  (req, res, next) => {
    Portfolio.findById(req.params.portfolioId)
      .populate("stocks")
      .then((portfolio) => {
        if (portfolio.stocks.length !== 0) {
          portfolio.stocks.forEach((e) => {
            axios
              .get(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${e.ticker}&apikey=F6PG0KOXPZYMOK2E`
              )
              .then((newQuote) => {
                // console.log("NEW QUOTEE: ", newQuote.data);
                // console.log("E ID: ", e._id);
                Stock.findByIdAndUpdate(
                  e._id,
                  { quote: newQuote.data },
                  { new: true }
                ).then((stock) => {
                  // console.log("LINE 82 TEST: ", stock.quote);
                });
              });
          });
        }
      })
      .then(() => {
        Portfolio.findById(req.params.portfolioId)
          .populate("stocks")
          .then((portfolio) => {
            res.render("portfolio/portfolio.hbs", portfolio);
            // console.log("LINE 87: ", portfolio);
            // console.log("New quote: ", portfolio.stocks[0].quote);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

// edit portfolio
router.get("/edit/:portfolioId", isLoggedOut, isOwner, (req, res, next) => {
  const portfolioId = req.params.portfolioId;
  Portfolio.findById(portfolioId).then((portfolio) => {
    res.render("portfolio/edit-portfolio.hbs", portfolio);
    console.log(portfolio);
  });
});

router.post("/edit/:portfolioId", isLoggedOut, isOwner, (req, res, next) => {
  const portfolioId = req.params.portfolioId;
  const { name } = req.body;
  Portfolio.findByIdAndUpdate(portfolioId, { name: name }, { new: true })
    .then(() => {
      res.redirect("/users/dashboard");
    })
    .catch((err) => {
      console.log(err);
    });
});

// delete portfolio
router.post(
  "/delete-portfolio/:portfolioId",
  isLoggedOut,
  isOwner,
  (req, res, next) => {
    const portfolioId = req.params.portfolioId;
    console.log(portfolioId);
    User.findByIdAndUpdate(
      req.session.user._id,
      { $pull: { portfolios: portfolioId } },
      { new: true }
    )
      .then(() => {
        Portfolio.findByIdAndDelete(portfolioId).then(() => {
          res.redirect("/users/dashboard");
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

// add stock to portfolio
router.post("/portfolio/:portfolioId", isLoggedOut, isOwner, (req, res, next) => {
  const portfolioId = req.params.portfolioId;
  const { ticker } = req.body;

  Stock.find({ ticker: ticker }).then((foundStock) => {
    if (foundStock.length !== 0) {
      // console.log("LINE 103: ", foundStock, foundStock[0]._id);
      Portfolio.findByIdAndUpdate(
        portfolioId,
        {
          $push: { stocks: foundStock[0]._id },
        },
        { new: true }
      )
        .then((portfolio) => {
          // console.log("LINE 112: ", portfolio);
          res.redirect(`/users/portfolio/${portfolioId}`);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios
        .get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=F6PG0KOXPZYMOK2E`
        )
        .then((newQuote) => {
          const quote = [];
          quote.push(newQuote.data);
          console.log("LINE 114: ", quote[0].data);
          Stock.create({ ticker, quote }).then((newStock) => {
            Portfolio.findByIdAndUpdate(
              portfolioId,
              {
                $push: { stocks: newStock._id },
              },
              { new: true }
            )
              .then(() => {
                res.redirect(`/users/portfolio/${portfolioId}`);
              })
              .catch((err) => {
                console.log(err);
              });
          });
        });
    }
  });
});

// "delete" stock from portfolio (update portfolio)
router.post(
  "/portfolio/delete/:portfolioId/:stockId",
  isLoggedOut, isOwner, 
  (req, res, next) => {
    const portfolioId = req.params.portfolioId;
    const stockId = req.params.stockId;
    Portfolio.findByIdAndUpdate(
      portfolioId,
      { $pull: { stocks: stockId } },
      { new: true }
    )
      .then(() => {
        res.redirect(`/users/portfolio/${portfolioId}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

module.exports = router;
