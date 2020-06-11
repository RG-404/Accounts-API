const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    googleID: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    strikes: {
      type: Number,
      default: 0,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: "",
    },
    college: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    DOB: {
      type: Date,
      default: "",
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
