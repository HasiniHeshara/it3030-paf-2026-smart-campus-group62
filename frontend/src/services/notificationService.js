import { apiRequest } from "./api";

export const getMyNotifications = async () => {
  return await apiRequest("/notifications/me");
};

export const markNotificationAsRead = async (id) => {
  return await apiRequest(`/notifications/${id}/read`, {
    method: "PATCH",
  });
};

export const deleteNotification = async (id) => {
  return await apiRequest(`/notifications/${id}`, {
    method: "DELETE",
  });
};