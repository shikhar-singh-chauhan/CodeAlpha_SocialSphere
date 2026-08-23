const Post = require("../models/Post");
const Notification = require("../models/Notification");

// =====================================================
// CREATE COMMENT
// =====================================================

const createComment = async (req, res) => {
  try {
    const postId =
      req.params.postId;

    const userId =
      req.user?.id ||
      req.user?._id;

    const text =
      req.body?.text ||
      req.body?.content ||
      "";

    // =================================================
    // AUTH CHECK
    // =================================================

    if (!userId) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // =================================================
    // VALIDATE COMMENT
    // =================================================

    if (!text.trim()) {
      return res.status(400).json({
        message:
          "Comment text is required",
      });
    }

    if (text.trim().length > 500) {
      return res.status(400).json({
        message:
          "Comment cannot exceed 500 characters",
      });
    }

    // =================================================
    // FIND POST
    // =================================================

    const post =
      await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message:
          "Post not found",
      });
    }

    // =================================================
    // CREATE EMBEDDED COMMENT
    // =================================================

    const newComment =
      post.comments.create({
        user: userId,
        text: text.trim(),
      });

    post.comments.push(
      newComment
    );

    await post.save();

    // =================================================
    // POPULATE COMMENT USER
    // =================================================

    await post.populate({
      path: "comments.user",
      select:
        "name email profilePicture",
    });

    const populatedComment =
      post.comments.id(
        newComment._id
      );

    // =================================================
    // CREATE NOTIFICATION
    // Notification failure should NOT
    // make comment creation fail.
    // =================================================

    if (
      post.author.toString() !==
      userId.toString()
    ) {
      try {
        await Notification.create({
          recipient:
            post.author,

          sender:
            userId,

          type:
            "comment",

          post:
            post._id,
        });
      } catch (
        notificationError
      ) {
        console.error(
          "Comment notification error:",
          notificationError
        );
      }
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res
      .status(201)
      .json({
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

    return res
      .status(500)
      .json({
        message:
          error.message ||
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
    const postId =
      req.params.postId;

    const post =
      await Post.findById(
        postId
      ).populate({
        path:
          "comments.user",

        select:
          "name email profilePicture",
      });

    if (!post) {
      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });
    }

    return res
      .status(200)
      .json({
        comments:
          post.comments || [],
      });
  } catch (error) {
    console.error(
      "Get comments error:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          error.message ||
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
    const postId =
      req.params.postId;

    const commentId =
      req.params.id;

    const userId =
      req.user?.id ||
      req.user?._id;

    // =================================================
    // AUTH CHECK
    // =================================================

    if (!userId) {
      return res
        .status(401)
        .json({
          message:
            "Not authorized",
        });
    }

    // =================================================
    // FIND POST
    // =================================================

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

    // =================================================
    // FIND COMMENT
    // =================================================

    const comment =
      post.comments.id(
        commentId
      );

    if (!comment) {
      return res
        .status(404)
        .json({
          message:
            "Comment not found",
        });
    }

    // =================================================
    // CHECK COMMENT OWNER
    // =================================================

    if (
      !comment.user ||
      comment.user.toString() !==
        userId.toString()
    ) {
      return res
        .status(403)
        .json({
          message:
            "You are not allowed to delete this comment",
        });
    }

    const commentOwnerId =
      comment.user.toString();

    // =================================================
    // REMOVE EMBEDDED COMMENT
    // =================================================

    post.comments.pull(
      commentId
    );

    await post.save();

    // =================================================
    // REMOVE COMMENT NOTIFICATION
    // Notification cleanup failure should
    // NOT make deletion fail.
    // =================================================

    try {
      await Notification.findOneAndDelete({
        recipient:
          post.author,

        sender:
          commentOwnerId,

        type:
          "comment",

        post:
          post._id,
      });
    } catch (
      notificationError
    ) {
      console.error(
        "Delete comment notification error:",
        notificationError
      );
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res
      .status(200)
      .json({
        message:
          "Comment deleted successfully",

        commentId,
      });
  } catch (error) {
    console.error(
      "Delete comment error:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          error.message ||
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