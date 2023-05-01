const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Stock = require("../models/Stock");

// router.get("/dashboard/:userId", function (req, res, next) {
//   console.log("Req session user: ", req.session.user);
//   User.findById(req.params.userId)
//     .then((user) => {
//       if (req.session.user && user._id.toString() === req.session.user._id) {
//         res.render("users/user-dashboard.hbs", user);
//       } else if (req.session.user) {
//         User.findById(req.session.user._id).then((user) => {
//           res.redirect(`/users/dashboard/${user._id}`);
//         });
//       } else {
//         res.redirect("/auth/login");
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

router.get("/dashboard", (req, res, next) => {
  if (req.session.user) {
    User.findById(req.session.user._id)
      .populate("portfolios")
      .then((user) => {
        res.render("users/user-dashboard.hbs", user);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect("/auth/login");
  }
});

router.post("/dashboard", (req, res, next) => {
  // console.log('Req body: ', req.body);
  const { name } = req.body;
  console.log("Req body name: ", name);
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

router.get("/portfolio/:portfolioId", (req, res, next) => {
  Portfolio.findById(req.params.portfolioId)
    .populate("stocks")
    .then((portfolio) => {
      res.render("portfolio/portfolio.hbs", portfolio);
    });
});

router.post("/portfolio/:portfolioId", (req, res, next) => {
  const portfolioId = req.params.portfolioId;
  const { ticker, name } = req.body;
  Stock.create({ ticker, name }).then((newStock) => {
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

module.exports = router;
