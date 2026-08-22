import { useEffect, useState } from "react";
import api from "../services/api";

const Notifications = () => {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===============================
  // LOAD NOTIFICATIONS
  // ===============================
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api(
        "/notifications"
      );

      setNotifications(
        data.notifications || []
      );
    } catch (error) {
      console.error(
        "Notification error:",
        error
      );

      setError(
        error.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOAD ON PAGE OPEN
  // ===============================
  useEffect(() => {
    loadNotifications();
  }, []);

  // ===============================
  // MARK ONE AS READ
  // ===============================
  const markAsRead = async (
    notificationId
  ) => {
    try {
      await api(
        `/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id ===
          notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark as read error:",
        error
      );
    }
  };

  // ===============================
  // MARK ALL AS READ
  // ===============================
  const markAllAsRead = async () => {
    try {
      await api(
        "/notifications/read-all",
        {
          method: "PUT",
        }
      );

      setNotifications((previous) =>
        previous.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        )
      );
    } catch (error) {
      console.error(
        "Mark all as read error:",
        error
      );
    }
  };

  // ===============================
  // DELETE NOTIFICATION
  // ===============================
  const deleteNotification = async (
    notificationId
  ) => {
    try {
      await api(
        `/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification._id !==
            notificationId
        )
      );
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );
    }
  };

  // ===============================
  // NOTIFICATION TEXT
  // ===============================
  const getNotificationText = (
    notification
  ) => {
    const senderName =
      notification.sender?.name ||
      "Someone";

    switch (notification.type) {
      case "follow":
        return `${senderName} started following you`;

      case "like":
        return `${senderName} liked your post`;

      case "comment":
        return `${senderName} commented on your post`;

      default:
        return `${senderName} interacted with you`;
    }
  };

  // ===============================
  // NOTIFICATION ICON
  // ===============================
  const getNotificationIcon = (
    type
  ) => {
    switch (type) {
      case "follow":
        return "＋";

      case "like":
        return "♥";

      case "comment":
        return "◌";

      default:
        return "•";
    }
  };

  // ===============================
  // SENDER INITIAL
  // ===============================
  const getSenderInitial = (
    notification
  ) => {
    return (
      notification.sender?.name
        ?.charAt(0)
        ?.toUpperCase() || "U"
    );
  };

  // ===============================
  // UNREAD COUNT
  // ===============================
  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <main className="notifications-page">
        <div className="notifications-loading">
          <div className="loading-spinner"></div>

          <p>
            Loading notifications...
          </p>
        </div>
      </main>
    );
  }

  // ===============================
  // PAGE
  // ===============================
  return (
    <main className="notifications-page">

      {/* HEADER */}
      <div className="notifications-header">

        <div>
          <p className="notifications-eyebrow">
            ACTIVITY
          </p>

          <h1>
            Notifications
          </h1>

          <p className="notifications-subtitle">
            {unreadCount > 0
              ? `${unreadCount} unread ${
                  unreadCount === 1
                    ? "notification"
                    : "notifications"
                }`
              : "You're all caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="mark-all-button"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}

      </div>

      {/* ERROR */}
      {error && (
        <div className="notifications-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              loadNotifications()
            }
          >
            Retry
          </button>

        </div>
      )}

      {/* EMPTY STATE */}
      {!error &&
        notifications.length === 0 && (
          <div className="notifications-empty">

            <div className="notifications-empty-icon">
              ◌
            </div>

            <h3>
              No notifications yet
            </h3>

            <p>
              When someone follows you,
              likes your post, or comments
              on your post, you'll see it
              here.
            </p>

          </div>
        )}

      {/* NOTIFICATIONS */}
      {!error &&
        notifications.length > 0 && (
          <div className="notifications-list">

            {notifications.map(
              (notification) => (
                <article
                  key={
                    notification._id
                  }
                  className={`notification-card ${
                    notification.read
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                  onClick={() => {
                    if (
                      !notification.read
                    ) {
                      markAsRead(
                        notification._id
                      );
                    }
                  }}
                >

                  {/* STATUS */}
                  {!notification.read && (
                    <span className="notification-unread-dot"></span>
                  )}

                  {/* AVATAR */}
                  <div className="notification-avatar-wrap">

                    <div className="notification-avatar">
                      {getSenderInitial(
                        notification
                      )}
                    </div>

                    <div
                      className={`notification-type-icon notification-${notification.type}`}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                  </div>

                  {/* CONTENT */}
                  <div className="notification-content">

                    <p className="notification-message">
                      {getNotificationText(
                        notification
                      )}
                    </p>

                    {notification.post
                      ?.content && (
                      <div className="notification-post-preview">
                        {
                          notification
                            .post
                            .content
                        }
                      </div>
                    )}

                    <small className="notification-time">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </small>

                  </div>

                  {/* ACTION */}
                  <button
                    type="button"
                    className="notification-delete"
                    onClick={(event) => {
                      event.stopPropagation();

                      deleteNotification(
                        notification._id
                      );
                    }}
                  >
                    Delete
                  </button>

                </article>
              )
            )}

          </div>
        )}

    </main>
  );
};

export default Notifications;