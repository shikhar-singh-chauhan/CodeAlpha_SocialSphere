const express = require("express");

const {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
} = require("../controllers/profileController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// View profile
router.get("/:id", getProfile);

// Update own profile
router.put("/", protect, updateProfile);

// Follow user
router.post("/:id/follow", protect, followUser);

// Unfollow user
router.post("/:id/unfollow", protect, unfollowUser);

module.exports = router;