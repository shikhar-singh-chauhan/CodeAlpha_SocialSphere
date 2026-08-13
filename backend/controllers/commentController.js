const Comment = require("../models/Comment");
const Post = require("../models/Post");

// ===============================
// CREATE COMMENT
// ===============================
const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    // Check content
    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    // Check whether post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Create comment
    const comment = await Comment.create({
      content: content.trim(),
      author: req.user.id,
      post: postId,
    });

    // Populate author information
    await comment.populate("author", "name email");

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// GET COMMENTS FOR A POST
// ===============================
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check whether post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comments = await Comment.find({
      post: postId,
    })
      .populate("author", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// DELETE COMMENT
// ===============================
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    // Find comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Make sure comment belongs to this post
    if (comment.post.toString() !== postId) {
      return res.status(400).json({
        message: "Comment does not belong to this post",
      });
    }

    // Check ownership
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this comment",
      });
    }

    // Delete comment
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// EXPORT
// ===============================
module.exports = {
  createComment,
  getComments,
  deleteComment,
};