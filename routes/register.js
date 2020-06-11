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
let verifyEmail = require("../models/verifyEmail.model");

//Register
router.get("/", (req, res) => res.send("register"));

//Register Handle
router.post("/", (req, res) => {
  const { name, email, password } = req.body;
  let errors = [];

  //Check required fields
  if (!name || !email || !password) {
    errors.push({ message: "INCOMPLETE INFORMATION" });
  }

  //Check pass length
  if (password.length < 6) {
    errors.push({ message: "PASSWORD LENGTH LESS THAN 6" });
  }

  if (errors.length > 0) {
    res.status("422").json({ errors });
  } else {
    //Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        //User exists
        res.status(400).json({ message: "EMAIL ALREADY REGISTERED" });
      }

      //Create User
      else {
        const newUser = new User({
          username: email,
          name,
          email,
          password,
        });
        // Hash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            //error from bcrypt
            if (err) throw err;

            //set password to hashed
            newUser.password = hash;

            //Save User
            newUser.save().catch((err) => console.log(err));
          })
        );
        const verifyEmailToken = crypto.randomBytes(64).toString("hex");

        //Verify email
        const newVerifyEmail = new verifyEmail({
          email: email,
          token: verifyEmailToken,
        });
        newVerifyEmail
          .save()
          .then(() => {
            res.json({
              message: `REGISTRATION COMPLETED`,
            });
            sendVerificationEmail(email, verifyEmailToken);
          })
          .catch((err) => console.log(err));
      }
    });
  }
});

async function sendVerificationEmail(email, verifyEmailToken) {
  let transporter = nodemailer.createTransport({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  // Message object
  let message = {
    from: `FLING 👻 <${emailUser}>`,
    to: `Recipient <${email}>`,
    subject: "Verify your email ✔",
    html: `<b>Cling this link: </b><a href="http://localhost:3000/verify/${verifyEmailToken}">LINK</a>`, // html body
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
