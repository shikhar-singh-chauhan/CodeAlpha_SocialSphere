const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");

const cloudinary = require("../config/cloudinary");

// =====================================================
// CREATE POST
// =====================================================

const createPost = async (
  req,
  res
) => {
  try {
    const content =
      req.body.content?.trim() || "";

    // =================================================
    // FORMAT UPLOADED MEDIA
    // =================================================

    const media =
      (req.files || []).map(
        (file) => ({
          url:
            file.path,

          publicId:
            file.filename,

          resourceType:
            file.mimetype?.startsWith(
              "video/"
            )
              ? "video"
              : "image",
        })
      );

    // =================================================
    // REQUIRE TEXT OR MEDIA
    // =================================================

    if (
      !content &&
      media.length === 0
    ) {
      return res
        .status(400)
        .json({
          message:
            "Post must contain text, image, or video",
        });
    }

    // =================================================
    // CREATE POST
    // =================================================

    const post =
      await Post.create({
        content,

        author:
          req.user.id,

        media,
      });

    // =================================================
    // POPULATE AUTHOR
    // =================================================

    await post.populate(
      "author",
      "name email profilePicture"
    );

    res.status(201).json({
      message:
        "Post created successfully",

      post,
    });
  } catch (error) {
    console.error(
      "Create post error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Server error",
    });
  }
};

// =====================================================
// GET ALL POSTS
// =====================================================

const getPosts = async (
  req,
  res
) => {
  try {
    const posts =
      await Post.find()
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
      posts,
    });
  } catch (error) {
    console.error(
      "Get posts error:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};

// =====================================================
// GET PERSONALIZED FEED
// =====================================================

const getFeed = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res
        .status(404)
        .json({
          message:
            "User not found",
        });
    }

    // Current user + people they follow
    const feedUsers = [
      req.user.id,
      ...(user.following || []),
    ];

    const posts =
      await Post.find({
        author: {
          $in:
            feedUsers,
        },
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
      posts,
    });
  } catch (error) {
    console.error(
      "Get feed error:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};

// =====================================================
// GET SINGLE POST
// =====================================================

const getPostById = async (
  req,
  res
) => {
  try {
    const post =
      await Post.findById(
        req.params.id
      )
        .populate(
          "author",
          "name email profilePicture"
        )
        .populate(
          "comments.user",
          "name email profilePicture"
        );

    if (!post) {
      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });
    }

    res.status(200).json({
      post,
    });
  } catch (error) {
    console.error(
      "Get post error:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};

// =====================================================
// DELETE POST
// =====================================================

const deletePost = async (
  req,
  res
) => {
  try {
    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {
      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });
    }

    // =================================================
    // ONLY POST OWNER CAN DELETE
    // =================================================

    if (
      post.author.toString() !==
      req.user.id.toString()
    ) {
      return res
        .status(403)
        .json({
          message:
            "You are not allowed to delete this post",
        });
    }

    // =================================================
    // DELETE CLOUDINARY MEDIA
    // =================================================

    if (
      Array.isArray(
        post.media
      ) &&
      post.media.length > 0
    ) {
      for (
        const mediaItem of post.media
      ) {
        try {
          await cloudinary.uploader.destroy(
            mediaItem.publicId,
            {
              resource_type:
                mediaItem.resourceType ===
                "video"
                  ? "video"
                  : "image",
            }
          );
        } catch (
          cloudinaryError
        ) {
          console.error(
            "Cloudinary delete error:",
            cloudinaryError
          );
        }
      }
    }

    // =================================================
    // DELETE RELATED NOTIFICATIONS
    // =================================================

    await Notification.deleteMany({
      post:
        post._id,
    });

    // =================================================
    // DELETE POST
    // =================================================

    await Post.findByIdAndDelete(
      post._id
    );

    res.status(200).json({
      message:
        "Post deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete post error:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};

// =====================================================
// LIKE / UNLIKE POST
// =====================================================

const toggleLike = async (
  req,
  res
) => {
  try {
    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {
      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });
    }

    const userId =
      req.user.id;

    const alreadyLiked =
      post.likes.some(
        (id) =>
          id.toString() ===
          userId.toString()
      );

    // =================================================
    // UNLIKE
    // =================================================

    if (alreadyLiked) {
      post.likes =
        post.likes.filter(
          (id) =>
            id.toString() !==
            userId.toString()
        );

      await post.save();

      // Remove like notification
      await Notification.findOneAndDelete({
        recipient:
          post.author,

        sender:
          userId,

        type:
          "like",

        post:
          post._id,
      });

      return res
        .status(200)
        .json({
          message:
            "Post unliked",

          liked:
            false,

          likesCount:
            post.likes.length,
        });
    }

    // =================================================
    // LIKE
    // =================================================

    post.likes.push(
      userId
    );

    await post.save();

    // =================================================
    // LIKE NOTIFICATION
    // =================================================

    if (
      post.author.toString() !==
      userId.toString()
    ) {
      await Notification.create({
        recipient:
          post.author,

        sender:
          userId,

        type:
          "like",

        post:
          post._id,
      });
    }

    res.status(200).json({
      message:
        "Post liked",

      liked:
        true,

      likesCount:
        post.likes.length,
    });
  } catch (error) {
    console.error(
      "Like post error:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createPost,
  getPosts,
  getFeed,
  getPostById,
  deletePost,
  toggleLike,
};