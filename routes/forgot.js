const router = require("express").Router();

const nodemailer = require("nodemailer");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

require("dotenv").config();

//Email account credentials
const emailService = process.env.EMAIL_SERVICE;
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

//User model
let User = require("../models/user.model");

//Verify Email Model
let verifyForgotPass = require("../models/verifyForgotPass.model");

//Register
router.get("/", (req, res) => res.send("forgot"));

//Reset Request Handler
router.post("/", (req, res) => {
  const { email } = req.body;
  console.log("POST /forgot: ",req.body)
  let errors = [];

  //Check required fields
  if (!email) {
    errors.push({ message: "INCOMPLETE" });
  }

  if (errors.length > 0) {
    res.status("400").json({ errors });
  } else {
    //Validation passed
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        //User does not exists
        res.status(404).json({ message: "EMAIL NOT REGISTERED" });
      }
      //Forgot
      else {
        //generating token
        const verifyForgotPassToken = crypto.randomBytes(64).toString("hex");

        verifyForgotPass.findOne({ email: email }).then((existing) => {
          //Resend link
          if (!existing) {
            //Push token to DB -> verifyForgotPass
            const newVerifyForgotPass = new verifyForgotPass({
              email: email,
              token: verifyForgotPassToken,
            });
            newVerifyForgotPass
              .save()
              .then(() => {
                sendVerificationEmail(email, verifyForgotPassToken);
                res.json({ message: "LINK SENT" });
              })
              .catch((err) => console.log(err));
          }

          //Send link
          else {
            existing.token = verifyForgotPassToken;
            existing
              .save()
              .then(() => {
                sendVerificationEmail(email, verifyForgotPassToken);
                res.json({ message: "LINK RE-SENT" });
              })
              .catch((err) => console.log(err));
          }
        });
      }
    });
  }
});

//Password Update Handler
router.post("/reset", (req, res) => {
  const { newPassword, token } = req.body;
  let errors = [];

  if (!newPassword || !token) {
    errors.push({ message: "INCOMPLETE" });
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
  } else {
    verifyForgotPass.findOne({ token: token }).then((forgot) => {
      if (!forgot) {
        res.status(404).json({ message: "LINK INVALID OR EXPIRED" });
      } else {
        const email = forgot.email;
        User.findOne({ email: email }).then((user) => {
          if (!user) {
            res.status(402).send();
          } else {
            bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(newPassword, salt, (err, hash) => {
                if (err) throw err;
                //set password to hashed
                user.password = hash;
                //Save User
                user.save().catch((err) => console.log(err));
              })
            );
            verifyForgotPass
              .deleteOne({ token: token })
              .then(res.json({ message: "PASSWORD UPDATED" }))
              .catch((err) => console.log(err));
          }
        });
      }
    });
  }
});

async function sendVerificationEmail(email, newVerifyForgotPass) {
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
    subject: "Password Reset ✔",
    html: `<b>Click this link to resest password: </b><a href="http://172.20.10.3:3000/forgot/updatepassword/${newVerifyForgotPass}">LINK</a>`, // html body
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
