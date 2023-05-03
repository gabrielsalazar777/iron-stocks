const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const saltRounds = 10;

const { isLoggedIn } = require("../middleware/route-guard");
const { isLoggedOut } = require("../middleware/route-guard");

router.get("/register", isLoggedIn, (req, res, next) => {
  res.render("auth/register.hbs");
});

router.post("/register", isLoggedIn, (req, res, next) => {
  console.log("REGISTRATION: ", req.body);
  const { email, username, passwordClear } = req.body;

  if (!email || !username || !passwordClear) {
    res.render("auth/register.hbs", {
      errorMessage: "Please enter all fields.",
    });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  if (!regex.test(passwordClear)) {
    res.status(500).render("auth/register.hbs", {
      email,
      username,
      errorMessage:
        "Please enter password containing 8 characters, including one number, lowercase letter, and uppercase letter.",
    });
    return;
  }

  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(passwordClear, salt))
    .then((hashedPassword) => {
      return User.create({
        email,
        username,
        password: hashedPassword,
      });
    })
    .then((userFromDB) => {
      //   console.log("Newly created user is: ", userFromDB);
      res.redirect("/auth/login");
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res
          .status(500)
          .render("auth/register.hbs", { errorMessage: err.message });
      } else if (err.code === 11000) {
        // console.log("line 58 hit");
        res.status(500).render("auth/register.hbs", {
          errorMessage:
            "Username and email need to be unique. Either username or email is already used.",
        });
      } else {
        next(err);
      }
    });
});

router.get("/login", isLoggedIn, (req, res, next) => {
  res.render("auth/login.hbs");
});

router.post("/login", isLoggedIn, (req, res, next) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.render("auth/login.hbs", {
      errorMessage: "Please enter email and password to login.",
    });
    return;
  }

  User.findOne({ email })
    .then((user) => {
      if (user && bcryptjs.compareSync(password, user.password)) {
        req.session.user = user;
        res.redirect("/users/dashboard");
      } else {
        res.render("auth/login.hbs", {
          errorMessage: "Email or password is incorrect",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/logout", isLoggedOut, (req, res, next) => {
    // console.log(req.session.user)
  req.session.destroy((err) => {
    // if (err) next(err);
    res.redirect("/");
  });
});

module.exports = router;
