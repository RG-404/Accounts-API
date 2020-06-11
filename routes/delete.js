const router = require("express").Router();

const nodemailer = require("nodemailer");

const jwt = require("jsonwebtoken");

let User = require("../models/user.model");

require("dotenv").config();

//Email account credentials
const emailService = process.env.EMAIL_SERVICE;
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

router.get("/", (req, res) => res.send("DELETE WORKING"));

router.post("/", authenticateToken, (req, res) => {
  jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      email = authData.user.email;
      console.log(email);
      User.deleteOne({ email: email }).then(()=>{
          sendEmail(email)
          res.json({message: `${email} deleted`})
      })
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

async function sendEmail(email) {
  let transporter = nodemailer.createTransport({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  // Message object
  let message = {
    from: `AURIN <${emailUser}>`,
    to: `Recipient <${email}>`,
    subject: "Account deleted successfully ✔",
    html: `account deleted`, // html body
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log("Error occurred. " + err.message);
      return process.exit(1);
    }

    console.log("Message sent: %s", info.messageId);
  });
}

module.exports = router;
