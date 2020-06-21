const router = require("express").Router();

const passport = require("passport");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

//User model
let User = require("../models/user.model");

router.get("/", (req, res) => res.send("google auth"));

router.post("/", (req, res) => {
  const { googleID, email, name } = req.body;
  console.log("POST /googleauth: ",req.body)
  
  let errors = [];
  if (!googleID || !email || !name) {
    errors.push({ message: "INCOMPLETE" });
  }
  if (errors.length > 0) {
    res.status(403).json(errors);
  } else {
    //
    User.findOne({ email }).then((user) => {
      if (user) {
        //user signed in via email
        if (!googleID) {
          res.json({ message: "LOG IN VIA EMAIL ADDRESS" });
        }
        //already have
        bcrypt.compare(googleID, user.googleID, (err, isMatched) => {
          if (err) {
            console.log(err);
          } else if (isMatched) {
            console.log("user is found ", user.name);
            userPublicData = {
              id: user._id,
              email: user.email,
              username: user.username,
            };

            jwt.sign(
              { user: userPublicData },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "30d" },
              (err, token) => {
                if (err) {
                  console.log(err);
                } else if (user.email === user.username) {
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
      } else {
        //create new user
        const newUser = User({
          username: email,
          name,
          email,
          googleID,
          isVerified: true,
        });
        // Hash googleID
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.googleID, salt, (err, hash) => {
            //error from bcrypt
            if (err) throw err;

            //set googleID to hashed
            newUser.googleID = hash;

            //Save User
            newUser
              .save()
              .then((newUser) => {
                userPublicData = {
                  id: newUser._id,
                  email: newUser.email,
                  username: newUser.username,
                };

                //Generate JWT
                jwt.sign(
                  { user: userPublicData },
                  process.env.ACCESS_TOKEN_SECRET,
                  { expiresIn: "30d" },
                  (err, token) => {
                    if (err) {
                      console.log(err);
                    } else {
                      res.json({
                        message: "LOGIN SUCCESS",
                        token,
                        user: {
                          email: newUser.email,
                          name: newUser.name,
                          userID: newUser._id,
                        },
                        firstTime: true,
                      });
                    }
                  }
                );
                console.log("new user created", newUser);
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

module.exports = router;
