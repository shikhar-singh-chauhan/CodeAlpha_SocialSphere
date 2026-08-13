const express = require("express");

const {
  createComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create comment
router.post("/:postId/comments", protect, createComment);

// Get comments
router.get("/:postId/comments", getComments);

// Delete comment
router.delete(
  "/:postId/comments/:commentId",
  protect,
  deleteComment
);

module.exports = router;