const mongoose = require("mongoose");

const verifyForgotPassSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const verifyForgotPass = mongoose.model("verifyForgotPass", verifyForgotPassSchema);

module.exports = verifyForgotPass;