const User = require("../models/User");
const Post = require("../models/Post");

// ===============================
// GET USER PROFILE
// ===============================
const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("followers", "name email profilePicture")
      .populate("following", "name email profilePicture");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const posts = await Post.find({
      author: userId,
    })
      .populate("author", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      user,
      posts,
      postsCount: posts.length,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// UPDATE OWN PROFILE
// ===============================
const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) {
      if (name.trim() === "") {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      user.name = name.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture.trim();
    }

    await user.save();

    const userResponse = user.toObject();

    delete userResponse.password;

    res.status(200).json({
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// FOLLOW USER
// ===============================
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    // Cannot follow yourself
    if (targetUserId === currentUserId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User to follow not found",
      });
    }

    if (!currentUser) {
      return res.status(404).json({
        message: "Current user not found",
      });
    }

    // Check if already following
    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (alreadyFollowing) {
      return res.status(400).json({
        message: "You are already following this user",
      });
    }

    // Add target to current user's following
    currentUser.following.push(targetUserId);

    // Add current user to target's followers
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      message: "User followed successfully",
      following: true,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    console.error("Follow user error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// UNFOLLOW USER
// ===============================
const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!currentUser) {
      return res.status(404).json({
        message: "Current user not found",
      });
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (!isFollowing) {
      return res.status(400).json({
        message: "You are not following this user",
      });
    }

    // Remove target from following
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );

    // Remove current user from target's followers
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      message: "User unfollowed successfully",
      following: false,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    console.error("Unfollow user error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// EXPORT
// ===============================
module.exports = {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
};