const router = require("express").Router();

const bcrypt = require("bcryptjs");

require("dotenv").config();

//User model
let User = require("../models/user.model");

router.get("/", (req, res) => {
  const { email } = req.body;
  let errors = [];
  if (!email) {
    errors.push({ message: "INCOMPLETE INFO" });
  }
  if (errors.length > 0) {
    res.status(400).json({ errors });
  } else {
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          res.status(404).json({ message: "USER NOT FOUND" });
        } else {
          res.json({
            email: user.email,
            username: user.username,
            location: user.location,
            gender: user.gender,
            DOB: user.DOB,
            id: user._id,
          });
        }
      })
      .catch((err) => console.log(err));
  }
});

module.exports = router;
