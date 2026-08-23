const express = require("express");

const {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

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
// Supports profile picture upload
// ===============================

router.put(
  "/profile",
  protect,
  upload.single("profilePicture"),
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
// KEEP LAST
// ===============================

router.get(
  "/:id",
  protect,
  getUserProfile
);

module.exports = router;