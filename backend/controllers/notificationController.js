const Notification = require("../models/Notification");

// ===============================
// GET MY NOTIFICATIONS
// ===============================
const getNotifications = async (req, res) => {
  try {
    const notifications =
      await Notification.find({
        recipient: req.user.id,
      })
        .populate(
          "sender",
          "name email profilePicture"
        )
        .populate(
          "post",
          "content"
        )
        .sort({
          createdAt: -1,
        })
        .limit(50);

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// GET UNREAD COUNT
// ===============================
const getUnreadCount = async (
  req,
  res
) => {
  try {
    const count =
      await Notification.countDocuments({
        recipient: req.user.id,
        read: false,
      });

    res.status(200).json({
      count,
    });
  } catch (error) {
    console.error(
      "Get unread count error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// MARK ONE NOTIFICATION AS READ
// ===============================
const markAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        recipient: req.user.id,
      });

    if (!notification) {
      return res.status(404).json({
        message:
          "Notification not found",
      });
    }

    notification.read = true;

    await notification.save();

    res.status(200).json({
      message:
        "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// MARK ALL NOTIFICATIONS AS READ
// ===============================
const markAllAsRead = async (
  req,
  res
) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.status(200).json({
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// DELETE ONE NOTIFICATION
// ===============================
const deleteNotification = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOneAndDelete(
        {
          _id: req.params.id,
          recipient: req.user.id,
        }
      );

    if (!notification) {
      return res.status(404).json({
        message:
          "Notification not found",
      });
    }

    res.status(200).json({
      message:
        "Notification deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete notification error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// EXPORT
// ===============================
module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};