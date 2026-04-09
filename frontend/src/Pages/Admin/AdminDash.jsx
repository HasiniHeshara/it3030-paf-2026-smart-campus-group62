import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-page">
      <div className="admin-wrapper">
        <div className="admin-hero">
          <div>
            <p className="admin-tag">Administration Panel</p>
            <h1>Welcome, {user?.fullName}</h1>
            <p className="admin-subtitle">
              Manage bookings, users, maintenance, notifications, and key system
              activities from one place.
            </p>
          </div>

          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="admin-grid">
          <div className="admin-card" onClick={() => navigate("/admin/users")}>
            <h3>Manage Users</h3>
            <p>View, search, and manage all registered users in the system.</p>
          </div>

          <div
            className="admin-card"
            onClick={() => navigate("/admin/manage-bookings")}
          >
            <h3>Manage Bookings</h3>
            <p>View and manage all booking requests.</p>
          </div>

          <div className="admin-card" onClick={() => navigate("/maintenance")}>
            <h3>Maintenance Requests</h3>
            <p>Track and update maintenance issues and request statuses.</p>
          </div>

          <div className="admin-card" onClick={() => navigate("/notifications")}>
            <h3>Notifications</h3>
            <p>Send and review important system notifications.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;