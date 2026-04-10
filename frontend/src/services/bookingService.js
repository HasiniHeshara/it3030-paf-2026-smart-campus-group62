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

export async function getMyBookings(userEmail) {
  const data = await apiRequest(
    `/bookings/my?userEmail=${encodeURIComponent(userEmail)}`
  );
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

<<<<<<< Updated upstream
  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to update booking status");
  }

  return data;
}
=======
export async function cancelBooking(id, userEmail) {
  return await apiRequest(
    `/bookings/${id}/cancel?userEmail=${encodeURIComponent(userEmail)}`,
    {
      method: "PATCH",
    }
  );
}
>>>>>>> Stashed changes
