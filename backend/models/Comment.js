const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    // ===============================
    // COMMENT CONTENT
    // ===============================
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // ===============================
    // COMMENT AUTHOR
    // ===============================
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===============================
    // POST BEING COMMENTED ON
    // ===============================
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model(
  "Comment",
  commentSchema
);

module.exports = Comment;