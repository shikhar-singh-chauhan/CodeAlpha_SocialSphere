const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

// =====================================================
// GET USER PROFILE
// =====================================================

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    )
      .select("-password")
      .populate(
        "followers",
        "name email profilePicture"
      )
      .populate(
        "following",
        "name email profilePicture"
      );

    if (!user) {
      return res
        .status(404)
        .json({
          message: "User not found",
        });
    }

    // =================================================
    // GET USER POSTS
    // ALSO POPULATE COMMENT USERS
    // =================================================

    const posts = await Post.find({
      author: user._id,
    })
      .populate(
        "author",
        "name email profilePicture"
      )
      .populate(
        "comments.user",
        "name email profilePicture"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      user,
      posts,
    });
  } catch (error) {
    console.error(
      "Get user profile error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// UPDATE MY PROFILE
// =====================================================

const updateProfile = async (
  req,
  res
) => {
  try {
    const {
      name,
      bio,
      profilePicture,
    } = req.body;

    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res
        .status(404)
        .json({
          message: "User not found",
        });
    }

    // =================================================
    // UPDATE NAME
    // =================================================

    if (name !== undefined) {
      if (!name.trim()) {
        return res
          .status(400)
          .json({
            message:
              "Name cannot be empty",
          });
      }

      user.name = name.trim();
    }

    // =================================================
    // UPDATE BIO
    // =================================================

    if (bio !== undefined) {
      user.bio =
        bio.trim();
    }

    // =================================================
    // UPDATE PROFILE PICTURE
    // =================================================

    if (
      profilePicture !== undefined
    ) {
      user.profilePicture =
        profilePicture.trim();
    }

    await user.save();

    res.status(200).json({
      message:
        "Profile updated successfully",

      user: {
        _id:
          user._id,

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        bio:
          user.bio || "",

        profilePicture:
          user.profilePicture || "",

        followers:
          user.followers || [],

        following:
          user.following || [],
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// FOLLOW USER
// =====================================================

const followUser = async (
  req,
  res
) => {
  try {
    const currentUserId =
      req.user.id;

    const targetUserId =
      req.params.id;

    // =================================================
    // CANNOT FOLLOW YOURSELF
    // =================================================

    if (
      currentUserId.toString() ===
      targetUserId.toString()
    ) {
      return res
        .status(400)
        .json({
          message:
            "You cannot follow yourself",
        });
    }

    const currentUser =
      await User.findById(
        currentUserId
      );

    const targetUser =
      await User.findById(
        targetUserId
      );

    if (
      !currentUser ||
      !targetUser
    ) {
      return res
        .status(404)
        .json({
          message:
            "User not found",
        });
    }

    // =================================================
    // CHECK ALREADY FOLLOWING
    // =================================================

    const alreadyFollowing =
      currentUser.following.some(
        (id) =>
          id.toString() ===
          targetUserId.toString()
      );

    if (alreadyFollowing) {
      return res
        .status(400)
        .json({
          message:
            "You are already following this user",
        });
    }

    // =================================================
    // ADD TO FOLLOWING
    // =================================================

    currentUser.following.push(
      targetUserId
    );

    // =================================================
    // ADD TO FOLLOWERS
    // =================================================

    targetUser.followers.push(
      currentUserId
    );

    await currentUser.save();

    await targetUser.save();

    // =================================================
    // FOLLOW NOTIFICATION
    // =================================================

    await Notification.create({
      recipient:
        targetUserId,

      sender:
        currentUserId,

      type:
        "follow",
    });

    res.status(200).json({
      message:
        "User followed successfully",

      following: true,

      followersCount:
        targetUser.followers.length,
    });
  } catch (error) {
    console.error(
      "Follow user error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// UNFOLLOW USER
// =====================================================

const unfollowUser = async (
  req,
  res
) => {
  try {
    const currentUserId =
      req.user.id;

    const targetUserId =
      req.params.id;

    const currentUser =
      await User.findById(
        currentUserId
      );

    const targetUser =
      await User.findById(
        targetUserId
      );

    if (
      !currentUser ||
      !targetUser
    ) {
      return res
        .status(404)
        .json({
          message:
            "User not found",
        });
    }

    // =================================================
    // CHECK FOLLOWING
    // =================================================

    const isFollowing =
      currentUser.following.some(
        (id) =>
          id.toString() ===
          targetUserId.toString()
      );

    if (!isFollowing) {
      return res
        .status(400)
        .json({
          message:
            "You are not following this user",
        });
    }

    // =================================================
    // REMOVE FROM FOLLOWING
    // =================================================

    currentUser.following =
      currentUser.following.filter(
        (id) =>
          id.toString() !==
          targetUserId.toString()
      );

    // =================================================
    // REMOVE FROM FOLLOWERS
    // =================================================

    targetUser.followers =
      targetUser.followers.filter(
        (id) =>
          id.toString() !==
          currentUserId.toString()
      );

    await currentUser.save();

    await targetUser.save();

    // =================================================
    // REMOVE FOLLOW NOTIFICATION
    // =================================================

    await Notification.findOneAndDelete({
      recipient:
        targetUserId,

      sender:
        currentUserId,

      type:
        "follow",
    });

    res.status(200).json({
      message:
        "User unfollowed successfully",

      following: false,

      followersCount:
        targetUser.followers.length,
    });
  } catch (error) {
    console.error(
      "Unfollow user error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// SEARCH USERS
// =====================================================

const searchUsers = async (
  req,
  res
) => {
  try {
    const {
      query,
    } = req.query;

    if (
      !query ||
      !query.trim()
    ) {
      return res
        .status(400)
        .json({
          message:
            "Search query is required",
        });
    }

    const searchText =
      query.trim();

    const users =
      await User.find({
        $or: [
          {
            name: {
              $regex:
                searchText,

              $options:
                "i",
            },
          },
          {
            email: {
              $regex:
                searchText,

              $options:
                "i",
            },
          },
        ],
      })
        .select(
          "name email bio profilePicture followers following"
        )
        .limit(20);

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error(
      "Search users error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers,
};