import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  Info,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { getAdminDashboard } from "@/features/admin/api/admin.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminNotificationsPage() {
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const { data: dashRes, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getAdminDashboard,
    staleTime: 1000 * 15,
  });

  const pendingApps = dashRes?.data?.pendingDrivers ?? 0;
  const recentActivities = dashRes?.data?.recentActivity ?? [];

  // Construct real notification items from recent activities + pending alerts
  const notifications = [
    ...(pendingApps > 0
      ? [
          {
            id: "notif-pending-apps",
            title: "Pending Driver Applications Require Review",
            description: `${pendingApps} student applicant(s) are awaiting driving license and vehicle registration review.`,
            type: "WARNING",
            timestamp: new Date().toISOString(),
            read: false,
          },
        ]
      : []),
    ...recentActivities.map((act) => ({
      id: act.id,
      title: act.title,
      description: act.description,
      type: act.status === "COMPLETED" ? "SUCCESS" : "INFO",
      timestamp: act.timestamp,
      read: true,
    })),
  ];

  const filteredNotifications =
    filter === "UNREAD"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleMarkAllAsRead = () => {
    toast.success("All notifications marked as read");
  };

  const getIcon = (type: string) => {
    if (type === "WARNING") {
      return <FileCheck className="h-4 w-4 text-amber-600" />;
    }
    if (type === "SUCCESS") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }
    return <Info className="h-4 w-4 text-zinc-500" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Notifications Center
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Operational alerts, driver verifications, and platform updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Mark All Read</span>
          </Button>
        </div>
      </div>

      {/* ─── Tabs & Filters ─── */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === "ALL"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
          }`}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("UNREAD")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === "UNREAD"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* ─── Notifications List ─── */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
            <span>Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              No notifications
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              You are all caught up! No operational alerts require attention.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {filteredNotifications.map((notif) => {
              const timeStr = notif.timestamp
                ? new Date(notif.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now";

              return (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start justify-between gap-4 transition hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 text-xs ${
                    !notif.read ? "bg-amber-50/20 dark:bg-amber-950/10" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                        {notif.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-zinc-400 whitespace-nowrap shrink-0">
                    {timeStr}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
