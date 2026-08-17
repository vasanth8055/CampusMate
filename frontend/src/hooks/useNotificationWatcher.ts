import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMyNotifications, markAsRead } from "@/features/notification/api/notification.api";

export function useNotificationWatcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  // Track toasted notification IDs to ensure strict deduplication
  const displayedNotificationIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  const { data: notifsRes } = useQuery({
    queryKey: ["notifications", "watcher"],
    queryFn: getMyNotifications,
    staleTime: 1000 * 3,
    refetchInterval: 4000,
    refetchOnWindowFocus: true,
  });

  const notifications = notifsRes?.data ?? [];

  useEffect(() => {
    if (notifications.length === 0) return;

    if (isFirstLoad.current) {
      // Seed initial notification IDs so historical unread items aren't spammed as popups on initial login
      notifications.forEach((n) => displayedNotificationIds.current.add(n.id));
      isFirstLoad.current = false;
      return;
    }

    // Process new unread notifications
    const newUnreadNotifs = notifications.filter(
      (n) => !n.read && !displayedNotificationIds.current.has(n.id)
    );

    const isDriverView = location.pathname.startsWith("/driver");

    newUnreadNotifs.forEach((notif) => {
      displayedNotificationIds.current.add(notif.id);

      // Determine navigation target based on notification type and current view
      const type = (notif.type || "").toUpperCase();
      let targetPath = isDriverView ? "/driver/dashboard" : "/dashboard";
      let actionLabel = "View →";

      if (type.includes("REQUESTED")) {
        targetPath = "/driver/bookings";
        actionLabel = "View Request →";
      } else if (type.includes("ACCEPTED") || type.includes("CONFIRMED")) {
        targetPath = notif.tripId ? `/trips/${notif.tripId}` : "/bookings";
        actionLabel = "View Ride →";
      } else if (type.includes("STARTED")) {
        targetPath = notif.tripId
          ? isDriverView
            ? `/driver/trips/${notif.tripId}`
            : `/track/${notif.tripId}`
          : "/bookings";
        actionLabel = "Track Ride →";
      } else if (type.includes("COMPLETED")) {
        targetPath = isDriverView ? "/driver/trips" : "/history";
        actionLabel = "View History →";
      } else if (type.includes("CANCELLED")) {
        targetPath = isDriverView ? "/driver/bookings" : "/bookings";
        actionLabel = "View Details →";
      } else if (type.includes("REJECTED")) {
        targetPath = "/bookings";
        actionLabel = "View Bookings →";
      }

      // Invalidate relevant server queries so UI updates instantly
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["driver", "bookings"] });
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      qc.invalidateQueries({ queryKey: ["trips"] });

      // Trigger interactive in-app toast
      toast(notif.title, {
        description: notif.message,
        duration: 6000,
        action: {
          label: actionLabel,
          onClick: async () => {
            try {
              await markAsRead(notif.id);
              qc.invalidateQueries({ queryKey: ["notifications"] });
            } catch {}
            navigate(targetPath);
          },
        },
      });
    });
  }, [notifications, navigate, location.pathname, qc]);
}
