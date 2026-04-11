import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./BookingPage.css";
import {
  cancelBooking,
  createBooking,
  getMyBookings,
  getResources,
} from "../../../services/bookingService";

const initialForm = {
  resourceId: "",
  bookingDate: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: "",
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const selectedFromUrl = searchParams.get("resourceId");

  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const formRef = useRef(null);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const currentUserEmail = currentUser?.email || "";

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    if (currentUserEmail) {
      loadMyBookings();
    }
  }, [currentUserEmail]);

  useEffect(() => {
    if (selectedFromUrl && resources.length > 0) {
      const matched = resources.find(
        (resource) => String(resource.id) === String(selectedFromUrl)
      );

      if (matched) {
        setFormData((prev) => ({
          ...prev,
          resourceId: String(matched.id),
          expectedAttendees:
            prev.expectedAttendees || String(matched.capacity || ""),
        }));

        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, [selectedFromUrl, resources]);

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

  const loadMyBookings = async () => {
    try {
      setLoadingBookings(true);
      setError("");
      const data = await getMyBookings();
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

  const handleResourceSelect = (resource) => {
    setFormData((prev) => ({
      ...prev,
      resourceId: String(resource.id),
      expectedAttendees:
        prev.expectedAttendees || String(resource.capacity || ""),
    }));

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        resourceId: Number(formData.resourceId),
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        expectedAttendees: Number(formData.expectedAttendees),
      };

      const result = await createBooking(payload);

      setMessage(
        `Booking request submitted successfully. Current status: ${result.status}`
      );
      setFormData(initialForm);
      await loadMyBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this approved booking?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      setMessage("");
      setError("");

      await cancelBooking(bookingId);

      setMessage("Booking cancelled successfully");
      await loadMyBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
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
            <li>Only approved bookings can later be cancelled.</li>
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
                  onClick={() => handleResourceSelect(resource)}
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

        <div className="booking-panel" ref={formRef}>
          <div className="panel-header">
            <h2>Booking Request Form</h2>
            <p>Fill in the required details and submit your request.</p>
          </div>

          <form className="booking-form" onSubmit={handleBookingSubmit}>
            <div className="form-group">
              <label>Selected Resource</label>
              <input
                type="text"
                value={
                  selectedResource
                    ? `${selectedResource.name} (${selectedResource.type})`
                    : ""
                }
                placeholder="Select a resource first"
                readOnly
              />
            </div>

            {selectedResource && (
              <div className="selected-resource-note">
                Booking for: <strong>{selectedResource.name}</strong> · Capacity{" "}
                <strong>{selectedResource.capacity}</strong> · Available{" "}
                <strong>
                  {selectedResource.availabilityStart} -{" "}
                  {selectedResource.availabilityEnd}
                </strong>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Logged in as</label>
                <input
                  type="text"
                  value={currentUserEmail || "No logged-in user"}
                  readOnly
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
              disabled={submitting || !formData.resourceId || !currentUserEmail}
            >
              {submitting ? "Submitting..." : "Submit Booking Request"}
            </button>
          </form>
        </div>
      </section>

      <section className="booking-panel booking-history-panel">
        <div className="panel-header">
          <h2>My Bookings</h2>
          <p>Bookings are shown for your logged-in account.</p>
        </div>

        {!currentUserEmail ? (
          <p className="muted-text">Please login to view your bookings.</p>
        ) : loadingBookings ? (
          <p className="muted-text">Loading your bookings...</p>
        ) : myBookings.length === 0 ? (
          <p className="muted-text">No bookings found yet for your account.</p>
        ) : (
          <div className="booking-history-grid">
            {myBookings.map((booking) => (
              <div className="history-card" key={booking.id}>
                <div className="history-head">
                  <h3>{booking.resourceName}</h3>
                  <span className={`status-badge ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="booking-timeline">
                  <div className="timeline-step active">
                    <div className="timeline-dot"></div>
                    <span>Requested</span>
                  </div>

                  <div
                    className={`timeline-step ${
                      booking.status === "APPROVED" ||
                      booking.status === "REJECTED" ||
                      booking.status === "CANCELLED"
                        ? "active"
                        : ""
                    }`}
                  >
                    <div className="timeline-dot"></div>
                    <span>Reviewed</span>
                  </div>

                  <div
                    className={`timeline-step ${
                      booking.status === "APPROVED" || booking.status === "REJECTED"
                        ? "active"
                        : ""
                    } ${booking.status === "REJECTED" ? "rejected-step" : ""}`}
                  >
                    <div className="timeline-dot"></div>
                    <span>
                      {booking.status === "REJECTED"
                        ? "Rejected"
                        : "Approved / Rejected"}
                    </span>
                  </div>

                  <div
                    className={`timeline-step ${
                      booking.status === "CANCELLED"
                        ? "active cancelled-step"
                        : ""
                    }`}
                  >
                    <div className="timeline-dot"></div>
                    <span>Cancelled</span>
                  </div>
                </div>

                <div className="history-body">
                  <p><strong>Type:</strong> {booking.resourceType}</p>
                  <p><strong>Date:</strong> {booking.bookingDate}</p>
                  <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
                  <p><strong>Attendees:</strong> {booking.expectedAttendees}</p>
                  <p><strong>Purpose:</strong> {booking.purpose}</p>
                  <p>
                    <strong>Admin Reason:</strong>{" "}
                    {booking.adminReason ? booking.adminReason : "Not available"}
                  </p>
                </div>

                {booking.status === "APPROVED" && (
                  <div className="history-actions">
                    <button
                      type="button"
                      className="cancel-booking-btn"
                      disabled={cancellingId === booking.id}
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      {cancellingId === booking.id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default BookingPage;