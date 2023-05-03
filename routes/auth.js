const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const User = require("../models/User");

const { isLoggedIn } = require("../middleware/route-guard");
const { isLoggedOut } = require("../middleware/route-guard");

//test
// const request = require("request");
// const url =
//   "https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&limit=1&apikey=F6PG0KOXPZYMOK2E";
//test

router.get("/register", isLoggedIn, (req, res, next) => {
  //   axios
  //     .get(url)
  //     .then((news) => {
  //       console.log("News test: ", news.data.feed);
  //       res.render("auth/register.hbs");
  //     })
  //     .then(() => {
  //       axios
  //         .get(
  //           "https://www.alphavantage.co/query?function=OVERVIEW&symbol=IBM&apikey=F6PG0KOXPZYMOK2E"
  //         )
  //         .then((overview) => {
  //           console.log("Company overview: ", overview.data);
  //         });
  //     });
  //   console.log(req.body)
  res.render("auth/register.hbs");
});

router.post("/register", isLoggedIn, (req, res, next) => {
  console.log("REGISTRATION: ", req.body);
  const { email, username, password } = req.body;
  User.create({
    email,
    username,
    password,
  })
    .then(() => {
      res.redirect("/auth/login");
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/login", isLoggedIn, (req, res, next) => {
  res.render("auth/login.hbs");
});

router.post("/login", isLoggedIn, (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user && password === user.password) {
        console.log("Successful user/pw match: ", user);
        req.session.user = user;
        console.log("Session user: ", req.session.user);
        // res.redirect(`/users/dashboard/${user._id}`);
        res.redirect("/users/dashboard");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/logout", isLoggedOut, (req, res, next) => {
  req.session.destroy((err) => {
    // if (err) next(err);
    res.redirect("/");
  });
});

module.exports = router;
