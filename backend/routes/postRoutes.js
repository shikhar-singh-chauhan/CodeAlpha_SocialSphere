const express = require("express");

const {
  createPost,
  getPosts,
  getFeed,
  getPostById,
  deletePost,
  toggleLike,
} = require("../controllers/postController");

const {
  createComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// CREATE POST
// ===============================
router.post(
  "/",
  protect,
  createPost
);

// ===============================
// GET ALL POSTS
// ===============================
router.get(
  "/",
  getPosts
);

// ===============================
// GET PERSONALIZED FEED
// IMPORTANT: BEFORE /:id
// ===============================
router.get(
  "/feed",
  protect,
  getFeed
);

// ===============================
// CREATE COMMENT
// POST /api/posts/:postId/comments
// ===============================
router.post(
  "/:postId/comments",
  protect,
  createComment
);

// ===============================
// GET COMMENTS
// GET /api/posts/:postId/comments
// ===============================
router.get(
  "/:postId/comments",
  protect,
  getComments
);

// ===============================
// DELETE COMMENT
// DELETE /api/posts/:postId/comments/:id
// ===============================
router.delete(
  "/:postId/comments/:id",
  protect,
  deleteComment
);

// ===============================
// LIKE / UNLIKE POST
// ===============================
router.post(
  "/:id/like",
  protect,
  toggleLike
);

// ===============================
// DELETE POST
// ===============================
router.delete(
  "/:id",
  protect,
  deletePost
);

// ===============================
// GET SINGLE POST
// KEEP LAST
// ===============================
router.get(
  "/:id",
  getPostById
);

module.exports = router;