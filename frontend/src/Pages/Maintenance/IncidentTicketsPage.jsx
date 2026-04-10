import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  addIncidentComment,
  assignIncidentTicket,
  createIncidentTicket,
  deleteIncidentComment,
  getAdminUsers,
  getAllIncidentTickets,
  getAssignedIncidentTickets,
  getIncidentTicketById,
  getMyIncidentTickets,
  getResources,
  updateIncidentComment,
  updateIncidentTicketStatus,
  uploadIncidentAttachments,
} from "../../services/incidentTicketService";
import "./IncidentTicketsPage.css";

const createInitialTicketForm = {
  resourceId: "",
  location: "",
  category: "",
  description: "",
  priority: "MEDIUM",
  preferredContactName: "",
  preferredContactEmail: "",
  preferredContactPhone: "",
};

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const adminStatusOptions = ["IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

const IncidentTicketsPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);

  const [ticketForm, setTicketForm] = useState(createInitialTicketForm);
  const [ticketStatus, setTicketStatus] = useState("IN_PROGRESS");
  const [statusReason, setStatusReason] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [uploadFiles, setUploadFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const isTechnician = user?.role === "TECHNICIAN";

  const filteredAssignableUsers = useMemo(
    () => adminUsers.filter((candidate) => ["ADMIN", "TECHNICIAN"].includes(candidate.role)),
    [adminUsers]
  );

  const availableStatusOptions = useMemo(() => {
    if (!selectedTicket) return [];

    if (isAdmin) {
      return adminStatusOptions;
    }

    if (selectedTicket.status === "OPEN") {
      return ["IN_PROGRESS"];
    }

    if (selectedTicket.status === "IN_PROGRESS") {
      return ["RESOLVED"];
    }

    return [];
  }, [isAdmin, selectedTicket]);

  const canUserUpdateStatus = useMemo(() => {
    if (!selectedTicket || !user) return false;
    if (isAdmin) return true;
    return selectedTicket.assignedToUserId === user.id;
  }, [isAdmin, selectedTicket, user]);

  const maxAttachmentsLeft = useMemo(() => {
    const currentCount = selectedTicket?.attachments?.length || 0;
    return Math.max(0, 3 - currentCount);
  }, [selectedTicket]);

  useEffect(() => {
    if (!user) return;
    initializePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const initializePage = async () => {
    setLoading(true);
    setError("");

    try {
      const [resourceData, ticketData, usersData] = await Promise.all([
        getResources(),
        loadTicketsForRole(),
        isAdmin ? getAdminUsers() : Promise.resolve([]),
      ]);

      const normalizedTickets = Array.isArray(ticketData) ? ticketData : [];
      setResources(Array.isArray(resourceData) ? resourceData : []);
      setTickets(normalizedTickets);
      setAdminUsers(Array.isArray(usersData) ? usersData : []);

      if (normalizedTickets.length > 0) {
        await loadTicketDetail(normalizedTickets[0].id);
      } else {
        setSelectedTicket(null);
      }
    } catch (err) {
      setError(err.message || "Failed to load maintenance data");
    } finally {
      setLoading(false);
    }
  };

  const loadTicketsForRole = async () => {
    if (isAdmin) {
      return getAllIncidentTickets();
    }

    if (isTechnician) {
      return getAssignedIncidentTickets();
    }

    return getMyIncidentTickets();
  };

  const refreshTickets = async (selectTicketId) => {
    const data = await loadTicketsForRole();
    const normalized = Array.isArray(data) ? data : [];
    setTickets(normalized);

    const targetId = selectTicketId ?? selectedTicket?.id ?? normalized[0]?.id;
    if (targetId) {
      await loadTicketDetail(targetId);
    } else {
      setSelectedTicket(null);
    }
  };

  const loadTicketDetail = async (ticketId) => {
    setDetailLoading(true);
    setError("");

    try {
      const detail = await getIncidentTicketById(ticketId);
      setSelectedTicket(detail);

      if (detail?.assignedToUserId) {
        setAssigneeUserId(String(detail.assignedToUserId));
      }

      if (detail?.status === "OPEN") {
        setTicketStatus("IN_PROGRESS");
      } else if (detail?.status === "IN_PROGRESS") {
        setTicketStatus("RESOLVED");
      } else {
        setTicketStatus("IN_PROGRESS");
      }
    } catch (err) {
      setError(err.message || "Failed to load incident ticket details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setTicketForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...ticketForm,
        resourceId: Number(ticketForm.resourceId),
      };

      const created = await createIncidentTicket(payload);
      setMessage("Incident ticket created successfully.");
      setTicketForm(createInitialTicketForm);
      await refreshTickets(created?.id);
    } catch (err) {
      setError(err.message || "Failed to create incident ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttachmentUpload = async (event) => {
    event.preventDefault();

    if (!selectedTicket) return;

    if (!uploadFiles.length) {
      setError("Select at least one image to upload");
      return;
    }

    if (uploadFiles.length > maxAttachmentsLeft) {
      setError(`You can upload only ${maxAttachmentsLeft} more image(s) for this ticket`);
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      await uploadIncidentAttachments(selectedTicket.id, uploadFiles);
      setUploadFiles([]);
      setMessage("Attachments uploaded successfully.");
      await refreshTickets(selectedTicket.id);
    } catch (err) {
      setError(err.message || "Failed to upload attachments");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTicket || !assigneeUserId) {
      setError("Select a technician or admin to assign this ticket");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      await assignIncidentTicket(selectedTicket.id, Number(assigneeUserId));
      setMessage("Ticket assigned successfully.");
      await refreshTickets(selectedTicket.id);
    } catch (err) {
      setError(err.message || "Failed to assign ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedTicket) return;

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      await updateIncidentTicketStatus(selectedTicket.id, {
        status: ticketStatus,
        reason: ticketStatus === "REJECTED" ? statusReason : "",
        resolutionNotes: resolutionNotes || "",
      });

      setStatusReason("");
      setResolutionNotes("");
      setMessage("Ticket status updated successfully.");
      await refreshTickets(selectedTicket.id);
    } catch (err) {
      setError(err.message || "Failed to update ticket status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!selectedTicket || !commentText.trim()) return;

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      await addIncidentComment(selectedTicket.id, commentText.trim());
      setCommentText("");
      setMessage("Comment added successfully.");
      await refreshTickets(selectedTicket.id);
    } catch (err) {
      setError(err.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleSaveCommentEdit = async () => {
    if (!selectedTicket || !editingCommentId || !editingCommentText.trim()) return;

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      await updateIncidentComment(selectedTicket.id, editingCommentId, editingCommentText.trim());
      cancelEditComment();
      setMessage("Comment updated successfully.");
      await refreshTickets(selectedTicket.id);
    } catch (err) {
      setError(err.message || "Failed to update comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedTicket) return;

    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      await deleteIncidentComment(selectedTicket.id, commentId);
      setMessage("Comment deleted successfully.");
      await refreshTickets(selectedTicket.id);
    } catch (err) {
      setError(err.message || "Failed to delete comment");
    } finally {
      setSubmitting(false);
    }
  };

  const canEditOrDeleteComment = (comment) => {
    if (!user) return false;
    if (isAdmin) return true;
    return comment.authorId === user.id;
  };

  if (!user) {
    return <main className="incident-page"><p className="status-note">Please login to use maintenance features.</p></main>;
  }

  return (
    <main className="incident-page">
      <section className="incident-hero">
        <div>
          <span className="incident-tag">Maintenance and Incident Ticketing</span>
          <h1>Create, track, and resolve campus incidents in one workspace.</h1>
          <p>
            Report issues with facilities, upload evidence, collaborate with staff through comments,
            and monitor workflow progress from OPEN to CLOSED.
          </p>
        </div>
        <div className="incident-hero-role">
          <h3>Current Role</h3>
          <strong>{user.role}</strong>
          <p>
            {isAdmin
              ? "You can manage all tickets, assign technicians, and control full workflow transitions."
              : isTechnician
              ? "You can work on assigned incidents and resolve them with notes."
              : "You can create tickets, upload evidence, and participate in comments."}
          </p>
        </div>
      </section>

      <section className="incident-layout">
        <article className="incident-panel">
          <h2>Create Ticket</h2>
          <form className="incident-form" onSubmit={handleCreateTicket}>
            <label>
              Resource
              <select name="resourceId" value={ticketForm.resourceId} onChange={handleFormChange} required>
                <option value="">Select resource</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} - {resource.location}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Location
              <input name="location" value={ticketForm.location} onChange={handleFormChange} required />
            </label>

            <label>
              Category
              <input name="category" value={ticketForm.category} onChange={handleFormChange} required />
            </label>

            <label>
              Priority
              <select name="priority" value={ticketForm.priority} onChange={handleFormChange}>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </label>

            <label className="full-width">
              Description
              <textarea
                name="description"
                value={ticketForm.description}
                onChange={handleFormChange}
                rows="4"
                required
              />
            </label>

            <label>
              Preferred Contact Name
              <input name="preferredContactName" value={ticketForm.preferredContactName} onChange={handleFormChange} />
            </label>

            <label>
              Preferred Contact Email
              <input
                name="preferredContactEmail"
                type="email"
                value={ticketForm.preferredContactEmail}
                onChange={handleFormChange}
              />
            </label>

            <label>
              Preferred Contact Phone
              <input name="preferredContactPhone" value={ticketForm.preferredContactPhone} onChange={handleFormChange} />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Incident Ticket"}
            </button>
          </form>
        </article>

        <article className="incident-panel">
          <div className="panel-head-row">
            <h2>
              {isAdmin ? "All Tickets" : isTechnician ? "Assigned Tickets" : "My Tickets"}
            </h2>
            <button type="button" onClick={() => refreshTickets()} disabled={submitting || loading}>
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="status-note">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="status-note">No incident tickets found.</p>
          ) : (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  className={`ticket-item ${selectedTicket?.id === ticket.id ? "active" : ""}`}
                  onClick={() => loadTicketDetail(ticket.id)}
                >
                  <div className="ticket-item-head">
                    <strong>#{ticket.id}</strong>
                    <span className={`status-pill status-${ticket.status?.toLowerCase()}`}>{ticket.status}</span>
                  </div>
                  <p>{ticket.category}</p>
                  <small>{ticket.location}</small>
                </button>
              ))}
            </div>
          )}
        </article>
      </section>

      {message && <div className="message-box success">{message}</div>}
      {error && <div className="message-box error">{error}</div>}

      <section className="incident-detail-wrap">
        <article className="incident-panel detail-main">
          <h2>Ticket Detail</h2>
          {detailLoading ? (
            <p className="status-note">Loading details...</p>
          ) : !selectedTicket ? (
            <p className="status-note">Select a ticket to view details.</p>
          ) : (
            <>
              <div className="detail-grid">
                <div><span>ID</span><strong>#{selectedTicket.id}</strong></div>
                <div><span>Status</span><strong>{selectedTicket.status}</strong></div>
                <div><span>Priority</span><strong>{selectedTicket.priority}</strong></div>
                <div><span>Category</span><strong>{selectedTicket.category}</strong></div>
                <div><span>Resource</span><strong>{selectedTicket.resourceName}</strong></div>
                <div><span>Location</span><strong>{selectedTicket.location}</strong></div>
              </div>

              <div className="description-box">
                <h4>Description</h4>
                <p>{selectedTicket.description}</p>
              </div>

              <div className="history-box">
                <h4>Status and Assignment Snapshot</h4>
                <ul>
                  <li>Created: {selectedTicket.createdAt}</li>
                  <li>Updated: {selectedTicket.updatedAt}</li>
                  <li>Current status: {selectedTicket.status}</li>
                  <li>Assigned to: {selectedTicket.assignedToName || "Not assigned"}</li>
                  <li>Reported by: {selectedTicket.reportedByName}</li>
                </ul>
              </div>

              <div className="attachments-box">
                <h4>Attachments ({selectedTicket.attachments?.length || 0}/3)</h4>
                {selectedTicket.attachments?.length ? (
                  <ul>
                    {selectedTicket.attachments.map((attachment) => (
                      <li key={attachment.id}>
                        <span>{attachment.originalFileName}</span>
                        <small>{attachment.contentType} • {attachment.fileSize} bytes</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No attachments uploaded yet.</p>
                )}

                <form onSubmit={handleAttachmentUpload} className="attachment-form">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(event) => setUploadFiles(Array.from(event.target.files || []))}
                    disabled={maxAttachmentsLeft === 0 || submitting}
                  />
                  <button type="submit" disabled={!uploadFiles.length || maxAttachmentsLeft === 0 || submitting}>
                    Upload Attachments
                  </button>
                </form>
              </div>
            </>
          )}
        </article>

        <article className="incident-panel detail-side">
          <h2>Actions</h2>

          {selectedTicket && isAdmin && (
            <div className="action-group">
              <h4>Assign Technician/Staff</h4>
              <select value={assigneeUserId} onChange={(event) => setAssigneeUserId(event.target.value)}>
                <option value="">Select assignee</option>
                {filteredAssignableUsers.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.fullName} ({candidate.role})
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleAssign} disabled={submitting || !assigneeUserId}>
                Assign Ticket
              </button>
            </div>
          )}

          {selectedTicket && canUserUpdateStatus && (
            <div className="action-group">
              <h4>Update Status</h4>
              <select value={ticketStatus} onChange={(event) => setTicketStatus(event.target.value)}>
                {availableStatusOptions.length === 0 ? (
                  <option value="">No valid next transition</option>
                ) : (
                  availableStatusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))
                )}
              </select>

              {ticketStatus === "REJECTED" && (
                <textarea
                  rows="3"
                  placeholder="Rejection reason"
                  value={statusReason}
                  onChange={(event) => setStatusReason(event.target.value)}
                />
              )}

              {ticketStatus === "RESOLVED" && (
                <textarea
                  rows="3"
                  placeholder="Resolution notes"
                  value={resolutionNotes}
                  onChange={(event) => setResolutionNotes(event.target.value)}
                />
              )}

              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={submitting || availableStatusOptions.length === 0 || !ticketStatus}
              >
                Save Status
              </button>
            </div>
          )}

          {selectedTicket && (
            <div className="comments-box">
              <h4>Comments</h4>

              <form onSubmit={handleAddComment} className="comment-form">
                <textarea
                  rows="3"
                  placeholder="Write a comment"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                />
                <button type="submit" disabled={submitting || !commentText.trim()}>
                  Add Comment
                </button>
              </form>

              <div className="comment-list">
                {(selectedTicket.comments || []).length === 0 ? (
                  <p className="status-note">No comments yet.</p>
                ) : (
                  selectedTicket.comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-head">
                        <strong>{comment.authorName}</strong>
                        <span>{comment.authorRole}</span>
                      </div>

                      {editingCommentId === comment.id ? (
                        <>
                          <textarea
                            rows="3"
                            value={editingCommentText}
                            onChange={(event) => setEditingCommentText(event.target.value)}
                          />
                          <div className="comment-actions">
                            <button type="button" onClick={handleSaveCommentEdit} disabled={submitting || !editingCommentText.trim()}>
                              Save
                            </button>
                            <button type="button" className="ghost" onClick={cancelEditComment} disabled={submitting}>
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <p>{comment.content}</p>
                      )}

                      <small>{comment.updatedAt}</small>

                      {canEditOrDeleteComment(comment) && editingCommentId !== comment.id && (
                        <div className="comment-actions">
                          <button type="button" className="ghost" onClick={() => startEditComment(comment)}>
                            Edit
                          </button>
                          <button type="button" className="danger" onClick={() => handleDeleteComment(comment.id)}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
};

export default IncidentTicketsPage;
