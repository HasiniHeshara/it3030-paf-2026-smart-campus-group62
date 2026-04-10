import React, { useEffect, useState } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../../services/notificationService";
import "./NotificationsPage.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (error) {
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      loadNotifications();
    } catch (error) {
      alert("Failed to mark notification as read");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      loadNotifications();
    } catch (error) {
      alert("Failed to delete notification");
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>My Notifications</h1>
          <p>View important updates related to bookings, tickets, and comments.</p>
        </div>

        {loading ? (
          <p className="notifications-empty">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="notifications-empty">No notifications available.</p>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${
                  notification.read ? "read" : "unread"
                }`}
              >
                <div className="notification-top">
                  <div>
                    <h3>{notification.title}</h3>
                    <span className="notification-type">{notification.type}</span>
                  </div>
                  <span className="notification-status">
                    {notification.read ? "Read" : "Unread"}
                  </span>
                </div>

                <p className="notification-message">{notification.message}</p>

                <p className="notification-date">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>

                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="mark-btn"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as Read
                    </button>
                  )}

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(notification.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;