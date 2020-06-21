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
  console.log("POST /auth REQUEST BODY: ", req.body);

  let errors = [];

  if (!email || !password) {
    errors.push({ message: "INCOMPLETE CREDENTIALS" });
  }
  //check for errors then proceeds
  if (errors.length > 0) {
    res.status("422").json({ errors });
    console.log("/auth: ERROR!", errors);
  } else {
    //finds user from Users in DB
    console.log("/auth: Searching for user.....");
    User.findOne({ email: email })
      .then((user) => {
        //assumptions
        let isVerified = true;
        let logedIn = false;
        //user not found
        if (!user) {
          console.log("/auth: User not found");
          res.status(404).json({
            message: "EMAIL NOT REGISTERED",
          });
        }

        //user found with email registration
        else if (user.password) {
          console.log("/auth: User found");
          console.log("/auth: Comparing password with hash.....");

          //password compare
          bcrypt.compare(password, user.password, (err, isMatched) => {
            //error by bcrypt
            if (err) {
              console.log("/auth: BCRYPT ERROR!", err);
              throw err;
            }
            //password match
            if (isMatched) {
              console.log("/auth: Password matched");

              if (!user.isVerified) {
                isVerified = false;
              }
              logedIn = true;
            }
            //password did not match
            else {
              console.log(
                "/auth: Password did not match. Sending 403 response....."
              );
              res.status(403).json({
                message: "INCORRECT EMAIL OR PASSWORD",
              });
            }
            //account not verified
            if (!isVerified) {
              console.log(
                "/auth: User is not verified. Sending 403 response....."
              );
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

              console.log("/auth: Generating JWT.....");
              //generate JWT access token
              jwt.sign(
                { user: userPublicData },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "30d" },
                (err, token) => {
                  if (err) {
                    console.log("/auth: JWT ERROR!", err);
                  }
                  //checkes if user logged in first time
                  else if (user.email === user.username) {
                    console.log(
                      "/auth: JWT generated successfully. First login.  Sending 200 response....."
                    );

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
                    console.log(
                      "/auth: JWT generated successfully. Sending 200 response....."
                    );
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
        } else {
          console.log(
            "/auth: This is a google linked account"
          );
          res.status(404).json({
            message: "SIGN IN WITH GOOGLE",
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
