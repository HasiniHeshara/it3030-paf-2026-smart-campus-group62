const BASE_URL = "http://localhost:8081/api";

export async function getResources() {
  const response = await fetch(`${BASE_URL}/resources`);

  if (!response.ok) {
    throw new Error("Failed to fetch resources");
  }

  return response.json();
}

export async function createBooking(bookingData) {
  const response = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create booking");
  }

  return data;
}

export async function getMyBookings(userEmail) {
  const response = await fetch(
    `${BASE_URL}/bookings/my?userEmail=${encodeURIComponent(userEmail)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return response.json();
}