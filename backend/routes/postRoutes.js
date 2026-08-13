const express = require("express");

const {
  createPost,
  getPosts,
  getFeed,
  getPostById,
  deletePost,
  toggleLike,
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// CREATE POST
// ===============================
router.post("/", protect, createPost);

// ===============================
// GET ALL POSTS
// ===============================
router.get("/", getPosts);

// ===============================
// GET PERSONALIZED FEED
// IMPORTANT: This must come BEFORE /:id
// ===============================
router.get("/feed", protect, getFeed);

// ===============================
// GET SINGLE POST
// ===============================
router.get("/:id", getPostById);

// ===============================
// DELETE POST
// ===============================
router.delete("/:id", protect, deletePost);

// ===============================
// LIKE / UNLIKE POST
// ===============================
router.post("/:id/like", protect, toggleLike);

module.exports = router;