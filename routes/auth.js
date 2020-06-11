const router = require("express").Router();

const passport = require("passport");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

//User model
let User = require("../models/user.model");

router.get("/", (req, res) => res.send("login"));

router.post("/", (req, res) => {
  const { email, password } = req.body;
  let errors = [];

  if (!email || !password) {
    errors.push({ message: "INCOMPLETE CREDENTIALS" });
  }
  //check for errors then proceeds
  if (errors.length > 0) {
    res.status("422").json({ errors });
  } else {
    //finds user from Users in DB
    User.findOne({ email: email })
      .then((user) => {
        //assumptions
        let isVerified = true;
        let logedIn = false;
        //user not found
        if (!user) {
          res.status(404).json({
            message: "EMAIL NOT REGISTERED",
          });
        }
        //user found
        else {
          //password compare
          bcrypt.compare(password, user.password, (err, isMatched) => {
            //error by bcrypt
            if (err) throw err;
            //password match
            if (isMatched) {
              if (!user.isVerified) {
                isVerified = false;
              }
              logedIn = true;
            }
            //password did not match
            else {
              res.status(403).json({
                message: "INCORRECT EMAIL OR PASSWORD",
              });
            }
            //account not verified
            if (!isVerified) {
              res.status(403).json({
                message: "NOT VERIFIED",
              });
            }
            //login success
            if (isVerified && logedIn) {
              userPublicData = {
                id: user._id,
                email: user.email,
                username: user.username,
              };

              //generate JWT access token
              jwt.sign(
                { user: userPublicData },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "30d" },
                (err, token) => {
                  if (err) {
                    console.log(err);
                  }
                  //checkes if user logged in first time
                  else if (user.email === user.username) {
                    res.json({
                      message: "LOGIN SUCCESS",
                      token,
                      user: {
                        email: user.email,
                        name: user.name,
                        userID: user._id,
                      },
                      firstTime: true,
                    });
                  } else {
                    res.json({
                      message: "LOGIN SUCCESS",
                      token,
                      user: {
                        email: user.email,
                        name: user.name,
                        userID: user._id,
                      },
                    });
                  }
                }
              );
            }
          });
        }
      })
      .catch((err) => console.log(err));
  }
});

//auth with google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

//callback route for google to redirect to
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.send("callback URI");
});

module.exports = router;
