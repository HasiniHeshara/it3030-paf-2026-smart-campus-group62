import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notificationService";
import logo from "../assets/logo.png";
import "./NavBar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardPath =
    user?.role === "ADMIN" ? "/admin-dashboard" : "/dashboard";

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.read).length;
  }, [notifications]);

  const latestNotifications = useMemo(() => {
    return notifications.slice(0, 5);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      if (!user) return;
      const data = await getMyNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
      }
      await loadNotifications();
      setShowDropdown(false);
      navigate("/notifications");
    } catch (error) {
      console.error("Failed to open notification:", error);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand">
          <img src={logo} alt="Smart Campus Hub Logo" className="brand-logo" />
          <div className="brand-text">
            <h2>Smart Campus Hub</h2>
            <p>University Operations Platform</p>
          </div>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className="nav-link">
            Home
          </NavLink>
          <NavLink to="/facilities" className="nav-link">
            Facilities
          </NavLink>
          <NavLink to="/bookings" className="nav-link">
            Bookings
          </NavLink>
          <NavLink to="/maintenance" className="nav-link">
            Maintenance
          </NavLink>
          <NavLink to="/notifications" className="nav-link">
            Notifications
          </NavLink>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <div className="notification-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="bell-button"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  aria-label="Notifications"
                >
                  <FaBell />
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                      <h4>Notifications</h4>
                      <button
                        type="button"
                        className="view-all-btn"
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/notifications");
                        }}
                      >
                        View All
                      </button>
                    </div>

                    {latestNotifications.length === 0 ? (
                      <p className="notification-empty">
                        No notifications yet.
                      </p>
                    ) : (
                      <div className="notification-list">
                        {latestNotifications.map((item) => (
                          <div
                            key={item.id}
                            className={`notification-item ${
                              item.read ? "read" : "unread"
                            }`}
                            onClick={() => handleNotificationClick(item)}
                          >
                            <div className="notification-item-top">
                              <span className="notification-title">
                                {item.title}
                              </span>
                              {!item.read && <span className="dot-indicator" />}
                            </div>
                            <p className="notification-message">
                              {item.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link to={dashboardPath} className="nav-login-btn">
                Dashboard
              </Link>
              <button className="nav-login-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login-btn">
                Login
              </Link>
              <Link to="/register" className="nav-register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;