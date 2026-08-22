const express = require("express");

const {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// SEARCH USERS
// ===============================
router.get(
  "/search",
  protect,
  searchUsers
);

// ===============================
// UPDATE MY PROFILE
// ===============================
router.put(
  "/profile",
  protect,
  updateProfile
);

// ===============================
// FOLLOW USER
// ===============================
router.post(
  "/:id/follow",
  protect,
  followUser
);

// ===============================
// UNFOLLOW USER
// ===============================
router.post(
  "/:id/unfollow",
  protect,
  unfollowUser
);

// ===============================
// GET USER PROFILE
// ===============================
router.get(
  "/:id",
  protect,
  getUserProfile
);

module.exports = router;