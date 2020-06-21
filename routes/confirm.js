const router = require("express").Router();

//User model
let User = require("../models/user.model");
//Verify Email Model
let verifyEmail = require("../models/verifyEmail.model");

router.get("/", (req, res) => res.send("CONFIRM WORKING"));

router.post("/", (req, res) => {
  const { token } = req.body;
  console.log("POST /confirm: ",req.body)
  let errors = [];

  if (!token) {
    errors.push({ message: "INCOMPLETE" });
  } else {
    verifyEmail.findOne({ token: token }).then((verify) => {
      //token validity check
      if (!verify) {
        res.status(404).json({message : "INVALID LINK"});
      } else {
        //email from verifyEmails
        const email = verify.email;

        //find user from Users
        User.findOne({ email: email }).then((user) => {
          //user existence check
          if (!user) {
            res.status(404).json({message : "SOMETHING WENT WRONG"});
          } else {
            const name = user.name;

            //updates isVerified to true
            user.isVerified = true;

            //update User doc
            user
              .save()
              .then(
                res.json({
                  message: "EMAIL CONFIRMED",
                  name: name,
                })
              )
              .catch((err) => console.log(err));
          }
        });
        verifyEmail
          .deleteOne({ token: token })
          .catch((err) => console.log(err));
      }
    });
  }
});

module.exports = router;
