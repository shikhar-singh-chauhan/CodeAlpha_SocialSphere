const express = require("express");

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// GET MY NOTIFICATIONS
// ===============================
router.get(
  "/",
  protect,
  getNotifications
);

// ===============================
// GET UNREAD COUNT
// ===============================
router.get(
  "/unread-count",
  protect,
  getUnreadCount
);

// ===============================
// MARK ALL AS READ
// IMPORTANT: BEFORE /:id/read
// ===============================
router.put(
  "/read-all",
  protect,
  markAllAsRead
);

// ===============================
// MARK ONE AS READ
// ===============================
router.put(
  "/:id/read",
  protect,
  markAsRead
);

// ===============================
// DELETE NOTIFICATION
// ===============================
router.delete(
  "/:id",
  protect,
  deleteNotification
);

module.exports = router;