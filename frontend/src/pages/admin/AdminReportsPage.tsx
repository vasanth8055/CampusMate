import { useState } from "react";
import {
  Download,
  Users,
  UserCheck,
  MapPin,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const reports = [
    {
      id: "users",
      title: "Users Master Ledger",
      description: "Complete list of all registered riders, drivers, verified college credentials, and account statuses.",
      icon: Users,
      endpoint: "http://localhost:8080/api/v1/admin/reports/export/users",
      filename: "campusmate_users_export.csv",
    },
    {
      id: "drivers",
      title: "Drivers & Fleet Registry",
      description: "All approved and pending drivers with driving license numbers, registered vehicle models, and license plates.",
      icon: UserCheck,
      endpoint: "http://localhost:8080/api/v1/admin/reports/export/drivers",
      filename: "campusmate_drivers_export.csv",
    },
    {
      id: "trips",
      title: "Trips & Commute Schedules",
      description: "Historical and scheduled commute rides with departure times, routes, seat pricing, and completion statuses.",
      icon: MapPin,
      endpoint: "http://localhost:8080/api/v1/admin/reports/export/trips",
      filename: "campusmate_trips_export.csv",
    },
    {
      id: "bookings",
      title: "Passenger Bookings Ledger",
      description: "All seat reservations, fare splits, timestamps, and passenger records.",
      icon: Ticket,
      endpoint: "http://localhost:8080/api/v1/admin/reports/export/bookings",
      filename: "campusmate_bookings_export.csv",
    },
  ];

  const handleDownload = (reportId: string, endpoint: string, title: string) => {
    setDownloading(reportId);
    toast.info(`Generating ${title}...`);
    window.open(endpoint, "_blank");
    setTimeout(() => {
      setDownloading(null);
      toast.success(`${title} downloaded successfully.`);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Operational Reports & CSV Exports
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Export structured CSV data directly from CampusMate PostgreSQL databases.
        </p>
      </div>

      {/* ─── Reports Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          const isDownloading = downloading === r.id;

          return (
            <Card
              key={r.id}
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide border border-zinc-200 dark:border-zinc-700">
                    CSV Format
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {r.title}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">
                  {r.filename}
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownload(r.id, r.endpoint, r.title)}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-semibold"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isDownloading ? "Exporting..." : "Download CSV"}</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
