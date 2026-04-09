import React, { useEffect, useMemo, useState } from "react";
import "./BookingPage.css";
import {
  createBooking,
  getMyBookings,
  getResources,
} from "../../../services/bookingService";

const initialForm = {
  resourceId: "",
  userEmail: "",
  bookingDate: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: "",
};

const BookingPage = () => {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [myEmail, setMyEmail] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadResources();
  }, []);

  const selectedResource = useMemo(() => {
    return resources.find(
      (resource) => String(resource.id) === String(formData.resourceId)
    );
  }, [resources, formData.resourceId]);

  const availableResources = useMemo(() => {
    return resources.filter((resource) => resource.status === "ACTIVE");
  }, [resources]);

  const loadResources = async () => {
    try {
      setLoadingResources(true);
      setError("");
      const data = await getResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingResources(false);
    }
  };

  const loadMyBookings = async (email) => {
    try {
      setLoadingBookings(true);
      setError("");
      const data = await getMyBookings(email);
      setMyBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setMyBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...formData,
        resourceId: Number(formData.resourceId),
        expectedAttendees: Number(formData.expectedAttendees),
      };

      const result = await createBooking(payload);

      setMessage(
        `Booking request submitted successfully. Current status: ${result.status}`
      );
      setFormData(initialForm);

      if (myEmail) {
        loadMyBookings(myEmail);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewBookings = (e) => {
    e.preventDefault();
    if (!myEmail.trim()) {
      setError("Please enter your email to view your bookings");
      return;
    }
    loadMyBookings(myEmail.trim());
  };

  const getStatusClass = (status) => {
    if (status === "APPROVED") return "approved";
    if (status === "REJECTED") return "rejected";
    if (status === "CANCELLED") return "cancelled";
    return "pending";
  };

  return (
    <main className="booking-page">
      <section className="booking-hero">
        <div className="booking-hero-left">
          <span className="booking-tag">Booking Management</span>
          <h1>Request university facilities and track your booking status.</h1>
          <p>
            Choose an available resource, submit your booking request, and view
            the progress of your request through the booking workflow.
          </p>

          <div className="booking-flow">
            <div className="flow-pill">PENDING</div>
            <span className="flow-arrow">→</span>
            <div className="flow-pill">APPROVED / REJECTED</div>
            <span className="flow-arrow">→</span>
            <div className="flow-pill">CANCELLED</div>
          </div>
        </div>

        <div className="booking-hero-card">
          <h3>Booking Rules</h3>
          <ul>
            <li>Only active resources can be booked.</li>
            <li>Booking time must match the resource availability window.</li>
            <li>Expected attendees must not exceed capacity.</li>
            <li>Conflicting time slots will be rejected.</li>
          </ul>
        </div>
      </section>

      <section className="booking-layout">
        <div className="booking-panel">
          <div className="panel-header">
            <h2>Available Resources</h2>
            <p>Select a resource before submitting your booking request.</p>
          </div>

          {loadingResources ? (
            <p className="muted-text">Loading resources...</p>
          ) : availableResources.length === 0 ? (
            <p className="muted-text">No active resources found.</p>
          ) : (
            <div className="resource-grid">
              {availableResources.map((resource) => (
                <button
                  key={resource.id}
                  type="button"
                  className={`resource-card ${
                    String(formData.resourceId) === String(resource.id)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      resourceId: String(resource.id),
                    }))
                  }
                >
                  <div className="resource-top">
                    <span className="resource-type">{resource.type}</span>
                    <span className="resource-status">{resource.status}</span>
                  </div>
                  <h3>{resource.name}</h3>
                  <p>{resource.location}</p>
                  <div className="resource-meta">
                    <span>Capacity: {resource.capacity}</span>
                    <span>
                      {resource.availabilityStart} - {resource.availabilityEnd}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="booking-panel">
          <div className="panel-header">
            <h2>Booking Request Form</h2>
            <p>Fill in the required details and submit your request.</p>
          </div>

          <form className="booking-form" onSubmit={handleBookingSubmit}>
            <div className="form-group">
              <label>Selected Resource</label>
              <input
                type="text"
                value={selectedResource ? selectedResource.name : ""}
                placeholder="Select a resource first"
                readOnly
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleChange}
                  placeholder="student@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Expected Attendees</label>
                <input
                  type="number"
                  name="expectedAttendees"
                  value={formData.expectedAttendees}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g. 25"
                  required
                />
              </div>

              <div className="form-group form-group-full">
                <label>Purpose</label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter the purpose of this booking"
                  required
                />
              </div>
            </div>

            {message && <div className="success-box">{message}</div>}
            {error && <div className="error-box">{error}</div>}

            <button
              type="submit"
              className="submit-btn"
              disabled={submitting || !formData.resourceId}
            >
              {submitting ? "Submitting..." : "Submit Booking Request"}
            </button>
          </form>
        </div>
      </section>

      <section className="booking-panel booking-history-panel">
        <div className="panel-header">
          <h2>My Bookings</h2>
          <p>Enter your email and view your submitted booking requests.</p>
        </div>

        <form className="my-bookings-form" onSubmit={handleViewBookings}>
          <input
            type="email"
            value={myEmail}
            onChange={(e) => setMyEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button type="submit" className="secondary-action-btn">
            View My Bookings
          </button>
        </form>

        {loadingBookings ? (
          <p className="muted-text">Loading your bookings...</p>
        ) : myBookings.length === 0 ? (
          <p className="muted-text">
            No bookings found yet. Enter your email and check your booking
            history.
          </p>
        ) : (
          <div className="booking-history-grid">
            {myBookings.map((booking) => (
              <div className="history-card" key={booking.id}>
                <div className="history-head">
                  <h3>{booking.resourceName}</h3>
                  <span
                    className={`status-badge ${getStatusClass(booking.status)}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="history-body">
                  <p>
                    <strong>Type:</strong> {booking.resourceType}
                  </p>
                  <p>
                    <strong>Date:</strong> {booking.bookingDate}
                  </p>
                  <p>
                    <strong>Time:</strong> {booking.startTime} - {booking.endTime}
                  </p>
                  <p>
                    <strong>Attendees:</strong> {booking.expectedAttendees}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {booking.purpose}
                  </p>
                  <p>
                    <strong>Admin Reason:</strong>{" "}
                    {booking.adminReason ? booking.adminReason : "Not available"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default BookingPage;