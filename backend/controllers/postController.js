const Post = require("../models/Post");
const User = require("../models/User");

// ===============================
// CREATE POST
// ===============================
const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    // Check content
    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    // Create post using authenticated user's ID
    const post = await Post.create({
      content: content.trim(),
      author: req.user.id,
    });

    // Populate author information
    await post.populate("author", "name email profilePicture");

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// GET ALL POSTS
// ===============================
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// GET PERSONALIZED FEED
// ===============================
const getFeed = async (req, res) => {
  try {
    // Find logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Include:
    // 1. Logged-in user's own posts
    // 2. Posts from users they follow
    const feedUsers = [
      req.user.id,
      ...user.following,
    ];

    // Find posts from these users
    const posts = await Post.find({
      author: {
        $in: feedUsers,
      },
    })
      .populate("author", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error("Get feed error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// GET SINGLE POST
// ===============================
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email profilePicture"
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json({
      post,
    });
  } catch (error) {
    console.error("Get post error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// DELETE POST
// ===============================
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if logged-in user owns the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this post",
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// LIKE / UNLIKE POST
// ===============================
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const userId = req.user.id;

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId
    );

    // ===============================
    // UNLIKE
    // ===============================
    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );

      await post.save();

      return res.status(200).json({
        message: "Post unliked",
        liked: false,
        likesCount: post.likes.length,
      });
    }

    // ===============================
    // LIKE
    // ===============================
    post.likes.push(userId);

    await post.save();

    res.status(200).json({
      message: "Post liked",
      liked: true,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("Like post error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// EXPORT
// ===============================
module.exports = {
  createPost,
  getPosts,
  getFeed,
  getPostById,
  deletePost,
  toggleLike,
};