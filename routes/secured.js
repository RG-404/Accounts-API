const router = require("express").Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

router.get("/", authenticateToken, (req, res) => {

 jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
     if(err){
         res.sendStatus(403)
     } else {
         res.json({
             message: 'WELCOME',
             authData
         })
     }
 })
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
      const bearer = bearerHeader.split(' ');
      //get token from array
      const bearerToken = bearer[1];
      //set token
      req.token = bearerToken
      //next middleware
      next()
  } else {
    res.sendStatus(403);
  }
}

module.exports = router