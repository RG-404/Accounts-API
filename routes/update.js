const router = require("express").Router();

const jwt = require("jsonwebtoken");

let User = require("../models/user.model");

require("dotenv").config();

router.get("/", (req, res) => res.send("UPDATE"));

router.post("/", authenticateToken, (req, res) => {
  console.log(req.body);
  const { data } = req.body;
  let status = [];
  jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else if (data) {
      console.log("REQUEST AUTORISED");
      email = authData.user.email;
      User.findOne({ email })
        .then((user) => {
          if (data.username) {
            console.log("updating username.....");
            status.push({ message: "UPDATED username" });
            user.username = data.username;
          }
          if (data.name) {
            console.log("updating name.....");
            status.push({ message: "UPDATED name" });
            user.name = data.name;
          }
          if (data.location) {
            console.log("updating location.....");
            status.push({ message: "UPDATED location" });
            user.location = data.location;
          }
          if (data.college) {
            console.log("updating college.....");
            status.push({ message: "UPDATED college" });
            user.college = data.college;
          }
          if (data.gender) {
            console.log("updating gender.....");
            status.push({ message: "UPDATED gender" });
            user.gender = data.gender;
          }
          if (data.DOB) {
            console.log("updating DOB.....");
            status.push({ message: "UPDATED DOB" });
            user.DOB = data.DOB;
          }
          user.save().catch((err) => {
            console.log(err);
          });
          res.json({
            authData,
            status,
          });
        })
        .catch((err) => console.log(err));
    }
  });
});

//FORMAT OF TOKEN
//Authorization: Bearer <access_token>

function authenticateToken(req, res, next) {
  //v2
  //get auth header value
  const bearerHeader = req.headers["authorization"];
  // check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    //split at the space
    const bearer = bearerHeader.split(" ");
    //get token from array
    const bearerToken = bearer[1];
    //set token
    req.token = bearerToken;
    //next middleware
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = router;
