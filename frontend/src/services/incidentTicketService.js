import { apiRequest } from "./api";

export function getResources() {
  return apiRequest("/resources");
}

export function createIncidentTicket(payload) {
  return apiRequest("/incident-tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getIncidentTicketById(id) {
  return apiRequest(`/incident-tickets/${id}`);
}

export function getMyIncidentTickets() {
  return apiRequest("/incident-tickets/my");
}

export function getAssignedIncidentTickets() {
  return apiRequest("/incident-tickets/assigned");
}

export function getAllIncidentTickets(status) {
  const suffix = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest(`/incident-tickets${suffix}`);
}

export function assignIncidentTicket(ticketId, assigneeUserId) {
  return apiRequest(`/incident-tickets/${ticketId}/assign`, {
    method: "PUT",
    body: JSON.stringify({ assigneeUserId }),
  });
}

export function updateIncidentTicketStatus(ticketId, payload) {
  return apiRequest(`/incident-tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function uploadIncidentAttachments(ticketId, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return apiRequest(`/incident-tickets/${ticketId}/attachments`, {
    method: "POST",
    body: formData,
  });
}

export function addIncidentComment(ticketId, content) {
  return apiRequest(`/incident-tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      incidentTicketId: ticketId,
      content,
    }),
  });
}

export function updateIncidentComment(ticketId, commentId, content) {
  return apiRequest(`/incident-tickets/${ticketId}/comments/${commentId}`, {
    method: "PUT",
    body: JSON.stringify({
      incidentTicketId: ticketId,
      content,
    }),
  });
}

export function deleteIncidentComment(ticketId, commentId) {
  return apiRequest(`/incident-tickets/${ticketId}/comments/${commentId}`, {
    method: "DELETE",
  });
}

export function getAdminUsers() {
  return apiRequest("/admin/users");
}
