import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { NotificationResponse } from "../types/notification.types";

export const getMyNotifications = async () => {
  const { data } = await api.get<ApiResponse<NotificationResponse[]>>("/api/v1/notifications");
  return data;
};

export const getUnreadNotifications = async () => {
  const { data } = await api.get<ApiResponse<NotificationResponse[]>>("/api/v1/notifications/unread");
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get<ApiResponse<{ count: number }>>("/api/v1/notifications/unread-count");
  return data;
};

export const markAsRead = async (notificationId: string) => {
  const { data } = await api.patch<ApiResponse<NotificationResponse>>(`/api/v1/notifications/${notificationId}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await api.patch<ApiResponse<void>>("/api/v1/notifications/read-all");
  return data;
};
