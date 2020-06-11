const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");

const User = require("../models/user.model");

require("dotenv").config()

passport.use(
  new GoogleStrategy(
    {
      //options for google strat
      callbackURL: "/auth/google/redirect",
      clientID: process.env.PEOPLE_API_CLIENT_ID,
      clientSecret: process.env.PEOPLE_API_CLIENT_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      //passport callback func

      //check if user already exists
      User.findOne({ googleID: profile.id }).then((user) => {
        if (user) {
          //already have
          console.log("user is found", user.name);
        } else {
          //create new user
          new User({
            username: profile.emails[0].value,
            name: profile.displayName,
            email: profile.emails[0].value,
            googleID: profile.id,
            isVerified: true,
          })
            .save()
            .then((newUser) => {
              console.log("new user created", newUser);
            })
            .catch((err) => console.log(err));
        }
      });
    }
  )
);
