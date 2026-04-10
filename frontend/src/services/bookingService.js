import { apiRequest } from "./api";

export async function getResources() {
  const data = await apiRequest("/resources");
  return Array.isArray(data) ? data : [];
}

export async function createBooking(bookingData) {
  return await apiRequest("/bookings", {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
}

export async function getMyBookings() {
  const data = await apiRequest("/bookings/my");
  return Array.isArray(data) ? data : [];
}

export async function getAllBookings(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.append("status", filters.status);
  if (filters.userEmail) params.append("userEmail", filters.userEmail);
  if (filters.resourceId) params.append("resourceId", filters.resourceId);

  const query = params.toString();
  const data = await apiRequest(`/bookings${query ? `?${query}` : ""}`);
  return Array.isArray(data) ? data : [];
}

export async function updateBookingStatus(id, statusData) {
  return await apiRequest(`/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(statusData),
  });
}

export async function cancelBooking(id) {
  return await apiRequest(`/bookings/${id}/cancel`, {
    method: "PATCH",
  });
}