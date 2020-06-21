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
  console.log("POST /register CLIENT IP: ", req.connection.remoteAddress);
  console.log("POST /register CLIENT IP: ", req.headers['x-forwarded-for'], " (if server behind proxy)")

  console.log("POST /register REQUEST BODY: ", req.body);
  

  let errors = [];

  console.log("/register: Validating data.....");
  //Check required fields
  if (!name || !email || !password) {
    errors.push({ message: "INCOMPLETE INFORMATION" });
  } else {
    if (!validateEmail(email)) {
      errors.push({ message: "INVALID EMAIL ADDRESS" });
    }
    //Check pass length
    if (password.length < 6) {
      errors.push({ message: "PASSWORD LENGTH LESS THAN 6" });
    }
  }

  if (errors.length > 0) {
    res.status("422").json({ errors });
    console.log("/register ERROR!\n", errors, "\nSending 422 response.....");
  } else {
    //Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        //User exists
        console.log(
          "/register: User already exists. Sending 400 response....."
        );
        res.status(400).json({ message: "EMAIL ALREADY REGISTERED" });
      }

      //Create User
      else {
        console.log("/register: Creating new user.....");
        const newUser = new User({
          username: email,
          name,
          email,
          password,
        });
        // Hash Password
        console.log("/register: Hashing password.....");
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            //error from bcrypt
            if (err) {
              console.log("/register: BCRYPT ERROR!", err);
              throw err;
            }

            //set password to hashed
            newUser.password = hash;
            console.log("/register: Password hashed successfully");

            //Save User
            newUser
              .save()
              .then(() => {
                console.log(
                  "/register: New user created successfully."
                );
              })
              .catch((err) =>
                console.log(
                  "/register: ERROR WHILE SAVING NEW USER TO DATABASE",
                  err
                )
              );
          })
        );

        console.log("/register: Generating verification token.....");
        const verifyEmailToken = crypto.randomBytes(64).toString("hex");

        //Verify email
        const newVerifyEmail = new verifyEmail({
          email: email,
          token: verifyEmailToken,
        });
        newVerifyEmail
          .save()
          .then(() => {
            console.log(
              "/register: Token saved to database. Sending 200 response."
            );
            res.json({
              message: `REGISTRATION COMPLETED`,
            });
            sendVerificationEmail(email, verifyEmailToken);
          })
          .catch((err) =>
            console.log(
              "/register: ERROR WHILE SAVING VERIFICATION TOKEN TO DATABASE",
              err
            )
          );
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
    html: `<b>Cling this link: </b><a href="http://172.20.10.3:3000/verify/${verifyEmailToken}">LINK</a>`, // html body
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log("/register: Error occurred. " + err.message);
      return process.exit(1);
    }

    console.log("/register: Message sent: %s", info.messageId, " to ", email);
  });
}

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

module.exports = router;
