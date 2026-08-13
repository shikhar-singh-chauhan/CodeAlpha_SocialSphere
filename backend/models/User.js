const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ===============================
    // BASIC USER INFORMATION
    // ===============================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ===============================
    // PROFILE INFORMATION
    // ===============================
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },

    profilePicture: {
      type: String,
      default: "",
      trim: true,
    },

    // ===============================
    // FOLLOW SYSTEM
    // ===============================
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;