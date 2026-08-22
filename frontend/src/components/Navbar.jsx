import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  // ==========================================
  // LOAD UNREAD NOTIFICATION COUNT
  // ==========================================
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user) return;

      try {
        const data = await api(
          "/notifications/unread-count"
        );

        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error(
          "Notification count error:",
          error
        );
      }
    };

    loadUnreadCount();

    const interval = setInterval(
      loadUnreadCount,
      5000
    );

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ==========================================
  // USER INITIAL
  // ==========================================
  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  // ==========================================
  // USER PROFILE LINK
  // ==========================================
  const profilePath =
    user?._id
      ? `/profile/${user._id}`
      : "/home";

  // ==========================================
  // NAVBAR
  // ==========================================
  return (
    <header className="app-navbar">
      <div className="navbar-inner">

        {/* LEFT — BRAND */}
        <NavLink
          to="/home"
          className="navbar-brand"
        >
          SocialSphere
        </NavLink>

        {/* RIGHT NAVIGATION */}
        <nav className="navbar-right">

          {/* HOME */}
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `navbar-link ${
                isActive
                  ? "navbar-link-active"
                  : ""
              }`
            }
          >
            Home
          </NavLink>

          {/* SEARCH */}
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `navbar-link ${
                isActive
                  ? "navbar-link-active"
                  : ""
              }`
            }
          >
            Search
          </NavLink>

          {/* NOTIFICATIONS */}
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `navbar-link notification-link ${
                isActive
                  ? "navbar-link-active"
                  : ""
              }`
            }
          >
            Notifications

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </NavLink>

          {/* USER AREA */}
          {user && (
            <div className="navbar-user">

              <NavLink
                to={profilePath}
                className="navbar-profile"
              >
                <div className="navbar-avatar">

                  {user.profilePicture ? (
                    <img
                      src={
                        user.profilePicture
                      }
                      alt={
                        user.name || "User"
                      }
                    />
                  ) : (
                    userInitial
                  )}

                </div>

                <span className="navbar-user-name">
                  {user.name || "User"}
                </span>

              </NavLink>

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          )}

        </nav>

      </div>
    </header>
  );
}

export default Navbar;