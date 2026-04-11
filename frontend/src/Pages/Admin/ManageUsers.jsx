import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest("/admin/users");
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      alert(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.itNumber.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const technicianUsers = filteredUsers.filter((user) => user.role === "TECHNICIAN");
  const regularUsers = filteredUsers.filter((user) => user.role !== "TECHNICIAN");

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await apiRequest(`/admin/users/${id}`, {
        method: "DELETE",
      });

      const updated = users.filter((user) => user.id !== id);
      setUsers(updated);
      setFilteredUsers(updated);
      alert("User deleted successfully");
    } catch (error) {
      alert(error.message || "Failed to delete user");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading users...</div>;
  }

  return (
    <div className="manage-users-page">
      <div className="manage-users-wrapper">
        <div className="manage-users-header">
          <div>
            <p className="manage-users-tag">Admin Panel</p>
            <h1>Manage Users</h1>
            <p>View, search, and manage all registered users in the system.</p>
          </div>

          <input
            type="text"
            placeholder="Search by name, email, or IT number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="manage-users-search"
          />
        </div>

        <div className="manage-users-table-card">
          <div className="manage-users-section-head">
            <h2>Technician Accounts</h2>
            <span>{technicianUsers.length}</span>
          </div>

          <table className="manage-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Speciality</th>
                <th>Experience</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {technicianUsers.length > 0 ? (
                technicianUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.specialization || "N/A"}</td>
                    <td>{user.year || "N/A"}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-users">
                    No technicians found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="manage-users-table-card">
          <div className="manage-users-section-head">
            <h2>Regular Users</h2>
            <span>{regularUsers.length}</span>
          </div>

          <table className="manage-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>IT Number</th>
                <th>Faculty</th>
                <th>Year</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {regularUsers.length > 0 ? (
                regularUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName}</td>
                    <td>{user.itNumber}</td>
                    <td>{user.faculty}</td>
                    <td>{user.year}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-users">
                    No regular users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;