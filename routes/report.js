const router = require("express").Router();

let User = require("../models/user.model");

require("dotenv").config();

router.get("/", (req, res) => res.send("report"));

router.post("/", (req, res) => {
  const { email } = req.body;
  User.findOne({ email }).then((user) => {
    if (++user.strikes > process.env.SUSPEND_THRESHOLD) user.isSuspended = true;
    user
      .save()
      .then(res.json({ message: "REPORTED" }))
      .catch((err) => console.log(err));
  });
});

module.exports = router;
