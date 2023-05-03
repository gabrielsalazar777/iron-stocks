const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");

const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/users/dashboard");
  }
  next();
};

const isLoggedOut = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  next();
};

const isOwner = (req, res, next) => {
  User.findOne({ portfolios: req.params.portfolioId }).then((foundUser) => {
    console.log('Found user: ', foundUser)
    if (foundUser._id.toString() !== req.session.user._id.toString()) {
      return res.redirect("/users/dashboard");
    }
  });
  next();
};

module.exports = { isLoggedIn, isLoggedOut, isOwner };
