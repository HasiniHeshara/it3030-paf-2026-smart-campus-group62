const BASE_URL = "http://localhost:8082/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

export async function getResources() {
  const response = await fetch(`${BASE_URL}/resources`, {
    headers: getAuthHeaders(),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch resources");
  }

  return Array.isArray(data) ? data : [];
}

export async function createBooking(bookingData) {
  const response = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to create booking");
  }

  return data;
}

export async function getMyBookings(userEmail) {
  const response = await fetch(
    `${BASE_URL}/bookings/my?userEmail=${encodeURIComponent(userEmail)}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch bookings");
  }

  return response.json();
}
  return Array.isArray(data) ? data : [];
}

export async function getAllBookings(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.append("status", filters.status);
  if (filters.userEmail) params.append("userEmail", filters.userEmail);
  if (filters.resourceId) params.append("resourceId", filters.resourceId);

  const url = `${BASE_URL}/bookings${params.toString() ? `?${params.toString()}` : ""}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || `Failed to fetch all bookings (${response.status})`);
  }

  return Array.isArray(data) ? data : [];
}

export async function updateBookingStatus(id, statusData) {
  const response = await fetch(`${BASE_URL}/bookings/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(statusData),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to update booking status");
  }

  return data;
}
