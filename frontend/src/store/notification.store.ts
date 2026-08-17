import { create } from "zustand";
import type { NotificationResponse } from "@/features/notification/types/notification.types";

interface NotificationState {
  unreadCount: number;
  notifications: NotificationResponse[];
  setUnreadCount: (count: number) => void;
  setNotifications: (notifications: NotificationResponse[]) => void;
  addNotification: (notification: NotificationResponse) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],
  setUnreadCount: (count) => set({ unreadCount: count }),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
      notifications: [notification, ...state.notifications],
    })),
  markAllAsRead: () =>
    set((state) => ({
      unreadCount: 0,
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
