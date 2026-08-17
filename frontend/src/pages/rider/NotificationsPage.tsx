import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Car,
  ShieldAlert,
  ArrowLeft,
  CheckCheck,
} from "lucide-react";

import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "@/features/notification/api/notification.api";
import type { NotificationResponse } from "@/features/notification/types/notification.types";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: notifRes, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", "me"],
    queryFn: getMyNotifications,
    staleTime: 1000 * 4,
    refetchInterval: 4000,
  });

  const notifications: NotificationResponse[] = notifRes?.data ?? [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationClick = (notif: NotificationResponse) => {
    if (!notif.read) {
      markReadMutation.mutate(notif.id);
    }

    const type = (notif.type || "").toUpperCase();
    if (type.includes("REQUESTED")) {
      navigate("/driver/bookings");
    } else if (type.includes("ACCEPTED") || type.includes("CONFIRMED")) {
      navigate(notif.tripId ? `/trips/${notif.tripId}` : "/bookings");
    } else if (type.includes("STARTED")) {
      navigate(notif.tripId ? `/track/${notif.tripId}` : "/bookings");
    } else if (type.includes("COMPLETED")) {
      navigate("/history");
    } else if (type.includes("CANCELLED") || type.includes("REJECTED")) {
      navigate("/bookings");
    }
  };

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      toast.success("All notifications marked as read.");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Could not update notifications.");
    },
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const getIconForType = (type?: string) => {
    const t = (type || "").toUpperCase();
    if (t.includes("ACCEPTED") || t.includes("CONFIRMED")) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      );
    }
    if (t.includes("CANCELLED") || t.includes("REJECTED")) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-subtle text-danger">
          <XCircle className="h-5 w-5" />
        </div>
      );
    }
    if (t.includes("STARTED") || t.includes("ARRIVING")) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary">
          <Car className="h-5 w-5" />
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-subtle text-secondary">
        <Bell className="h-5 w-5" />
      </div>
    );
  };

  const formatTimestamp = (iso?: string) => {
    if (!iso) return "Just now";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-4xl space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/dashboard"))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Alerts & Notifications
            </h1>
            <p className="text-xs text-foreground-secondary mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}` : "All caught up"}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-1.5 rounded-xl bg-primary-subtle px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-subtle/80 transition"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-foreground-secondary animate-pulse space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div>Loading alerts...</div>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-danger/30 bg-danger-subtle/30 p-6 text-center space-y-3">
          <ShieldAlert className="h-8 w-8 text-danger mx-auto" />
          <div className="font-bold text-sm text-foreground">
            Unable to load notifications
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft"
          >
            Retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center shadow-soft space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <Bell className="h-7 w-7" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">
              No notifications
            </div>
            <p className="text-xs text-foreground-secondary mt-1 max-w-[240px]">
              You will receive real-time updates on your booking requests and trips here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition cursor-pointer ${
                notif.read
                  ? "border-border bg-surface hover:bg-surface-subtle"
                  : "border-primary/40 bg-primary-subtle/20 shadow-soft"
              }`}
            >
              {getIconForType(notif.type)}

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-foreground">
                    {notif.title}
                  </div>
                  {!notif.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 ml-2"></span>
                  )}
                </div>
                <p className="text-xs text-foreground-secondary">
                  {notif.message}
                </p>
                <div className="text-[10px] font-medium text-foreground-muted pt-1">
                  {formatTimestamp(notif.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
