import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAssignedIncidentTickets, getMyIncidentTickets } from "../../services/incidentTicketService";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    itNumber: "",
    faculty: "",
    year: "",
    email: "",
  });
  const [ticketSummary, setTicketSummary] = useState({ count: 0, label: "" });
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        itNumber: user.itNumber || "",
        faculty: user.faculty || "",
        year: user.year || "",
        email: user.email || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const loadTicketSummary = async () => {
      if (!user) {
        setSummaryLoading(false);
        return;
      }

      setSummaryLoading(true);

      try {
        const tickets = user.role === "TECHNICIAN"
          ? await getAssignedIncidentTickets()
          : await getMyIncidentTickets();

        setTicketSummary({
          count: Array.isArray(tickets) ? tickets.length : 0,
          label: user.role === "TECHNICIAN" ? "assigned incidents" : "maintenance requests",
        });
      } catch (error) {
        setTicketSummary({ count: 0, label: user.role === "TECHNICIAN" ? "assigned incidents" : "maintenance requests" });
      } finally {
        setSummaryLoading(false);
      }
    };

    loadTicketSummary();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(profileData);
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (error) {
      alert(error.message || "Failed to update profile");
    }
  };

  return (
    <div className="userdash-page">
      <div className="userdash-wrapper">
        <div className="userdash-hero">
          <div>
            <p className="userdash-tag">{user?.role === "TECHNICIAN" ? "Technician Dashboard" : "Student Dashboard"}</p>
            <h1>Welcome back, {user?.fullName}</h1>
            <p className="userdash-subtitle">
              {user?.role === "TECHNICIAN"
                ? "Manage your profile and work on assigned maintenance incidents from one place."
                : "Manage your profile, bookings, maintenance requests, and notifications from one place."}
            </p>
          </div>

          <div className="userdash-hero-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="userdash-btn primary"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className="userdash-btn secondary"
            >
              Notifications
            </button>
          </div>
        </div>

        <div className="userdash-grid">
          <div className="userdash-card profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h2>{user?.fullName}</h2>
                <p>{user?.email}</p>
              </div>
            </div>

            <div className="profile-info">
              <div className="info-row">
                <span>IT Number</span>
                <strong>{user?.itNumber}</strong>
              </div>
              <div className="info-row">
                <span>Faculty</span>
                <strong>{user?.faculty}</strong>
              </div>
              <div className="info-row">
                <span>Year</span>
                <strong>{user?.year}</strong>
              </div>
              <div className="info-row">
                <span>Role</span>
                <strong>{user?.role}</strong>
              </div>
            </div>
          </div>

          <div className="userdash-card stats-card">
            <h3>{user?.role === "TECHNICIAN" ? "Assigned Incidents" : "My Maintenance Requests"}</h3>
            <div className="stats-count">{summaryLoading ? "..." : ticketSummary.count}</div>
            <p>{ticketSummary.label || (user?.role === "TECHNICIAN" ? "assigned incidents" : "maintenance requests")}</p>
            <button onClick={() => navigate("/maintenance")} className="stats-btn">
              {user?.role === "TECHNICIAN" ? "Open Assigned Work" : "View Requests"}
            </button>
          </div>

          <div className="userdash-card actions-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button onClick={() => navigate("/bookings")} className="quick-btn">
                View Bookings
              </button>
              <button onClick={() => navigate("/maintenance")} className="quick-btn">
                {user?.role === "TECHNICIAN" ? "Assigned Tickets" : "Maintenance Requests"}
              </button>
              <button onClick={() => navigate("/notifications")} className="quick-btn">
                View Notifications
              </button>
              <button onClick={handleLogout} className="quick-btn logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="edit-modal-overlay">
            <div className="edit-modal">
              <div className="edit-modal-header">
                <h2>Edit Profile</h2>
                <button
                  className="close-btn"
                  onClick={() => setIsEditing(false)}
                >
                  ×
                </button>
              </div>

              <form className="edit-form" onSubmit={handleSave}>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                />

                <input
                  type="text"
                  name="itNumber"
                  value={profileData.itNumber}
                  onChange={handleChange}
                  placeholder="IT Number"
                  required
                />

                <select
                  name="faculty"
                  value={profileData.faculty}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Faculty</option>
                  <option value="Computing">Computing</option>
                  <option value="Business">Business</option>
                  <option value="Humanities">Humanities</option>
                  <option value="Engineering">Engineering</option>
                </select>

                <select
                  name="year"
                  value={profileData.year}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Year & Semester</option>
                  <option value="1st Year - 1st Semester">1st Year - 1st Semester</option>
                  <option value="1st Year - 2nd Semester">1st Year - 2nd Semester</option>
                  <option value="2nd Year - 1st Semester">2nd Year - 1st Semester</option>
                  <option value="2nd Year - 2nd Semester">2nd Year - 2nd Semester</option>
                  <option value="3rd Year - 1st Semester">3rd Year - 1st Semester</option>
                  <option value="3rd Year - 2nd Semester">3rd Year - 2nd Semester</option>
                  <option value="4th Year - 1st Semester">4th Year - 1st Semester</option>
                  <option value="4th Year - 2nd Semester">4th Year - 2nd Semester</option>
                </select>

                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />

                <div className="edit-actions">
                  <button type="button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;