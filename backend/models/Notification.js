const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      // ===============================
      // USER WHO RECEIVES NOTIFICATION
      // ===============================
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // ===============================
      // USER WHO CAUSED THE NOTIFICATION
      // ===============================
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // ===============================
      // NOTIFICATION TYPE
      // ===============================
      type: {
        type: String,
        enum: [
          "follow",
          "like",
          "comment",
        ],
        required: true,
      },

      // ===============================
      // RELATED POST
      // ===============================
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null,
      },

      // ===============================
      // READ STATUS
      // ===============================
      read: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

const Notification =
  mongoose.model(
    "Notification",
    notificationSchema
  );

module.exports = Notification;