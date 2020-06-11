const mongoose = require("mongoose");

const verifyEmailSchema = new mongoose.Schema({
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

const verifyEmail = mongoose.model("verifyEmail", verifyEmailSchema);

module.exports = verifyEmail;