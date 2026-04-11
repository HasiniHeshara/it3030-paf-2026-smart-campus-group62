import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./ManageBookings.css";
import { getAllBookings, updateBookingStatus } from "../../services/bookingService";

const initialFilters = {
  status: "",
  userEmail: "",
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionStatus, setActionStatus] = useState("");
  const [adminReason, setAdminReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBookings = async (customFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllBookings(customFilters);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCount = useMemo(() => bookings.length, [bookings]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadBookings(filters);
  };

  const openActionModal = (booking, status) => {
    setSelectedBooking(booking);
    setActionStatus(status);
    setAdminReason(status === "APPROVED" ? "Approved by admin" : "");
    setMessage("");
    setError("");
  };

  const closeActionModal = () => {
    setSelectedBooking(null);
    setActionStatus("");
    setAdminReason("");
  };

  const handleStatusUpdate = async () => {
    if (!selectedBooking || !actionStatus) return;

    if (actionStatus === "REJECTED" && !adminReason.trim()) {
      setError("Reason is required when rejecting a booking");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateBookingStatus(selectedBooking.id, {
        status: actionStatus,
        adminReason: adminReason.trim(),
      });

      setMessage(`Booking ${actionStatus.toLowerCase()} successfully`);
      closeActionModal();
      loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!bookings.length) {
      setError("No booking records available to download");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Booking Management Report", 14, 18);

    doc.setFontSize(11);
    doc.text(`Total Visible Bookings: ${bookings.length}`, 14, 26);
    doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 32);

    autoTable(doc, {
      startY: 40,
      head: [[
        "ID",
        "Resource",
        "Type",
        "User Email",
        "Date",
        "Time",
        "Status",
        "Reason"
      ]],
      body: bookings.map((booking) => [
        booking.id,
        booking.resourceName,
        booking.resourceType,
        booking.userEmail,
        booking.bookingDate,
        `${booking.startTime} - ${booking.endTime}`,
        booking.status,
        booking.adminReason || "-"
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [91, 120, 184],
      },
    });

    doc.save("booking-management-report.pdf");
  };

  const getStatusClass = (status) => {
    if (status === "APPROVED") return "approved";
    if (status === "REJECTED") return "rejected";
    if (status === "CANCELLED") return "cancelled";
    return "pending";
  };

  return (
    <main className="manage-bookings-page">
      <section className="manage-bookings-hero">
        <div>
          <span className="manage-tag">Admin Booking Control</span>
          <h1>Manage all booking requests</h1>
          <p>
            Review booking requests, filter records, and approve or reject requests with a reason.
          </p>
        </div>

        <div className="hero-stat-card">
          <h3>Total Visible Bookings</h3>
          <strong>{filteredCount}</strong>
        </div>
      </section>

      <section className="manage-bookings-panel">
        <div className="panel-header panel-header-actions">
          <div>
            <h2>Filters</h2>
            <p>Use filters to quickly find booking requests.</p>
          </div>

          <button
            type="button"
            className="download-pdf-btn"
            onClick={handleDownloadPdf}
          >
            Download PDF
          </button>
        </div>

        <form className="filter-form" onSubmit={handleApplyFilters}>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="form-group">
            <label>User Email</label>
            <input
              type="email"
              name="userEmail"
              value={filters.userEmail}
              onChange={handleFilterChange}
              placeholder="Search by user email"
            />
          </div>

          <button type="submit" className="primary-btn">
            Apply Filters
          </button>
        </form>
      </section>

      <section className="manage-bookings-panel">
        <div className="panel-header">
          <h2>Booking Requests</h2>
          <p>Approve or reject pending requests from here.</p>
        </div>

        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}

        {loading ? (
          <p className="muted-text">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="muted-text">No booking requests found.</p>
        ) : (
          <div className="booking-table-wrap">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Resource</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>
                      <div className="resource-cell">
                        <strong>{booking.resourceName}</strong>
                        <span>{booking.resourceType}</span>
                      </div>
                    </td>
                    <td>{booking.userEmail}</td>
                    <td>{booking.bookingDate}</td>
                    <td>{booking.startTime} - {booking.endTime}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{booking.adminReason || "—"}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="approve-btn"
                          disabled={booking.status !== "PENDING"}
                          onClick={() => openActionModal(booking, "APPROVED")}
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          className="reject-btn"
                          disabled={booking.status !== "PENDING"}
                          onClick={() => openActionModal(booking, "REJECTED")}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedBooking && (
        <div className="modal-overlay">
          <div className="status-modal">
            <h3>
              {actionStatus === "APPROVED" ? "Approve Booking" : "Reject Booking"}
            </h3>

            <p><strong>Booking ID:</strong> {selectedBooking.id}</p>
            <p><strong>Resource:</strong> {selectedBooking.resourceName}</p>
            <p><strong>User:</strong> {selectedBooking.userEmail}</p>

            <div className="form-group">
              <label>Reason</label>
              <textarea
                rows="4"
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                placeholder="Enter admin reason"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={closeActionModal}>
                Cancel
              </button>
              <button type="button" className="primary-btn" onClick={handleStatusUpdate} disabled={saving}>
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ManageBookings;