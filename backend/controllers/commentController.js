const Post = require("../models/Post");
const Notification = require("../models/Notification");

// =====================================================
// CREATE COMMENT
// =====================================================

const createComment = async (req, res) => {
  try {
    const postId =
      req.params.postId;

    // Support both frontend field names
    const text =
      req.body.text ||
      req.body.content;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !text ||
      !text.trim()
    ) {
      return res
        .status(400)
        .json({
          message:
            "Comment text is required",
        });
    }

    // ==========================================
    // FIND POST
    // ==========================================

    const post =
      await Post.findById(
        postId
      );

    if (!post) {
      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });
    }

    // ==========================================
    // ADD COMMENT DIRECTLY TO POST
    // ==========================================

    post.comments.push({
      user:
        req.user.id,

      text:
        text.trim(),
    });

    await post.save();

    // ==========================================
    // GET NEW COMMENT
    // ==========================================

    const newComment =
      post.comments[
        post.comments.length - 1
      ];

    // ==========================================
    // RELOAD POST WITH COMMENT USER
    // ==========================================

    const populatedPost =
      await Post.findById(
        post._id
      )
        .populate(
          "author",
          "name email profilePicture"
        )
        .populate(
          "comments.user",
          "name email profilePicture"
        );

    const populatedComment =
      populatedPost.comments.id(
        newComment._id
      );

    // ==========================================
    // NOTIFICATION
    // ==========================================

    if (
      post.author.toString() !==
      req.user.id.toString()
    ) {
      await Notification.create({
        recipient:
          post.author,

        sender:
          req.user.id,

        type:
          "comment",

        post:
          post._id,
      });
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      message:
        "Comment added successfully",

      comment:
        populatedComment,
    });
  } catch (error) {
    console.error(
      "Create comment error:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};

// =====================================================
// GET COMMENTS
// =====================================================

const getComments = async (
  req,
  res
) => {
  try {
    const post =
      await Post.findById(
        req.params.postId
      )
        .populate(
          "comments.user",
          "name email profilePicture"
        );

    if (!post) {
      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });
    }

    res.status(200).json({
      comments:
        post.comments || [],
    });
  } catch (error) {
    console.error(
      "Get comments error:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};

// =====================================================
// DELETE COMMENT
// =====================================================

const deleteComment = async (
  req,
  res
) => {
  try {
    const post =
      await Post.findById(
        req.params.postId
      );

    if (!post) {
      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });
    }

    const comment =
      post.comments.id(
        req.params.id
      );

    if (!comment) {
      return res
        .status(404)
        .json({
          message:
            "Comment not found",
        });
    }

    // ==========================================
    // CHECK OWNER
    // ==========================================

    if (
      comment.user.toString() !==
      req.user.id.toString()
    ) {
      return res
        .status(403)
        .json({
          message:
            "You are not allowed to delete this comment",
        });
    }

    // Save info before removal
    const commentUser =
      comment.user;

    // ==========================================
    // REMOVE COMMENT
    // ==========================================

    post.comments =
      post.comments.filter(
        (item) =>
          item._id.toString() !==
          req.params.id.toString()
      );

    await post.save();

    // ==========================================
    // REMOVE RELATED NOTIFICATION
    // ==========================================

    await Notification.findOneAndDelete({
      recipient:
        post.author,

      sender:
        commentUser,

      type:
        "comment",

      post:
        post._id,
    });

    res.status(200).json({
      message:
        "Comment deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete comment error:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createComment,
  getComments,
  deleteComment,
};