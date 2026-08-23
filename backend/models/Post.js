const mongoose = require("mongoose");

// ===============================
// COMMENT SCHEMA
// ===============================

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// ===============================
// MEDIA SCHEMA
// ===============================

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    resourceType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
  },
  {
    _id: false,
  }
);

// ===============================
// POST SCHEMA
// ===============================

const postSchema = new mongoose.Schema(
  {
    // ===============================
    // TEXT CONTENT
    // ===============================

    content: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    // ===============================
    // AUTHOR
    // ===============================

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===============================
    // MEDIA
    // ===============================

    media: {
      type: [mediaSchema],
      default: [],
    },

    // ===============================
    // LIKES
    // ===============================

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ===============================
    // COMMENTS
    // ===============================

    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// VALIDATE POST
//
// IMPORTANT:
// Do NOT use function(next) + next() here.
//
// This modern middleware works correctly when post.save()
// is called while liking/commenting/deleting comments.
// =====================================================

postSchema.pre(
  "validate",
  function () {
    const hasText =
      typeof this.content ===
        "string" &&
      this.content.trim().length >
        0;

    const hasMedia =
      Array.isArray(this.media) &&
      this.media.length > 0;

    if (
      !hasText &&
      !hasMedia
    ) {
      this.invalidate(
        "content",
        "Post must contain text, image, or video"
      );
    }
  }
);

// ===============================
// MODEL
// ===============================

const Post = mongoose.model(
  "Post",
  postSchema
);

module.exports = Post;