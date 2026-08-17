import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  FileCheck,
  Navigation,
  Download,
  Clock,
  ArrowRight,
  ShieldCheck,
  Car,
  Bike,
  Activity,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  getAdminDashboard,
  approveAdminDriver,
  rejectAdminDriver,
} from "@/features/admin/api/admin.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Custom Leaflet icons for mini-map
const campusIcon = L.divIcon({
  html: `<div style="background-color:#18181b;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid #fff;">📍</div>`,
  className: "custom-pin",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const { data: dashRes, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getAdminDashboard,
    staleTime: 1000 * 15,
    refetchInterval: 15000,
  });

  const d = dashRes?.data;

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (driverId: string) => approveAdminDriver(driverId),
    onSuccess: () => {
      toast.success("Driver application approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setSelectedDriver(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to approve application");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ driverId, reason }: { driverId: string; reason: string }) =>
      rejectAdminDriver(driverId, reason),
    onSuccess: () => {
      toast.success("Driver application rejected.");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setSelectedDriver(null);
      setRejectModalOpen(false);
      setRejectionReason("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reject application");
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Top Banner ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Dashboard Overview
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            System status and operational metrics for today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-xs flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>Today</span>
          </div>

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

          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-white dark:text-zinc-900 shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* ─── Error Alert Banner ─── */}
      {isError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>Unable to load live dashboard statistics. {(error as any)?.message || "Service unavailable."}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* ─── 4 Top KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Users
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {d?.totalUsers ?? 0}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {d?.verifiedStudents ?? 0} Verified Students
            </span>
          </div>
        </Card>

        {/* Approved Drivers */}
        <Card className="p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Approved Drivers
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {d?.approvedDrivers ?? 0}
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              of {d?.totalDrivers ?? 0} Registered
            </span>
          </div>
        </Card>

        {/* Pending Applications */}
        <Card className="p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Pending Apps
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {d?.pendingDrivers ?? 0}
            </span>
            <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
              Awaiting Review
            </span>
          </div>
        </Card>

        {/* Active Trips */}
        <Card className="p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Active Trips
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Navigation className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {d?.activeTrips ?? 0}
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {d?.totalTrips ?? 0} Total Scheduled
            </span>
          </div>
        </Card>
      </div>

      {/* ─── Two-Column Middle Section ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Pending Driver Applications Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pending Driver Applications
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Students awaiting license and vehicle verification
              </p>
            </div>
            <Link
              to="/admin/applications"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading applications...</span>
              </div>
            ) : !d?.pendingApplications || d.pendingApplications.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  All applications processed
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  No pending driver submissions awaiting administrative review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider font-bold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4">Vehicle</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {d.pendingApplications.map((app: any) => {
                      const submittedDate = app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now";

                      return (
                        <tr key={app.driverId} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                                {app.firstName?.[0] || "U"}
                                {app.lastName?.[0] || ""}
                              </div>
                              <div>
                                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                                  {app.firstName} {app.lastName}
                                </div>
                                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                  {app.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                            {submittedDate}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {app.vehicle ? (
                              <div className="flex items-center gap-1.5">
                                {app.vehicle.vehicleType === "BIKE" || app.vehicle.vehicleType === "SCOOTER" ? (
                                  <Bike className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                                ) : (
                                  <Car className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                                )}
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                  {app.vehicle.brand} {app.vehicle.model}
                                </span>
                                <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                  {app.vehicle.registrationNumber}
                                </span>
                              </div>
                            ) : (
                              <span className="text-zinc-400 italic">No vehicle</span>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 text-[10px] font-bold">
                              Reviewing
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedDriver(app)}
                              className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-900 shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition inline-flex items-center gap-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Review</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1 span): Active Rides Map & Highlights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Active Rides</h2>
            <Link
              to="/admin/active-rides"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
            >
              <span>LIVE MAP</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl p-4 space-y-3">
            <div className="h-48 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative z-0">
              <MapContainer
                center={[16.5062, 80.648]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[16.4839, 80.6934]} icon={campusIcon}>
                  <Popup>VRSEC Siddhartha Campus</Popup>
                </Marker>
                <Marker position={[16.4419, 80.6222]} icon={campusIcon}>
                  <Popup>KL Deemed to be University</Popup>
                </Marker>
                <Marker position={[16.5062, 80.648]} icon={campusIcon}>
                  <Popup>Benz Circle Vijayawada</Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-900 dark:bg-zinc-100"></span>
                </span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">High Demand:</span>
              </div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">VRSEC ➔ Benz Circle</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-bold uppercase">
                  Completed Today
                </div>
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {d?.completedTrips ?? 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-bold uppercase">
                  Total Volume
                </div>
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  ₹{d?.totalRevenue ?? 0}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── Bottom Section: Recent Activity Feed ─── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Recent System Activity</h2>
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl overflow-hidden">
          {!d?.recentActivity || d.recentActivity.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
              No recent activity recorded.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {d.recentActivity.map((act) => {
                const timeStr = act.timestamp
                  ? new Date(act.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recent";

                return (
                  <div
                    key={act.id}
                    className="p-3.5 px-4 flex items-center justify-between gap-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold shrink-0">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{act.title}</div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {act.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        {timeStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ─── Driver Review Modal ─── */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Review Driver Application
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Verify student documents and vehicle eligibility
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-zinc-500">Applicant:</span>
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {selectedDriver.firstName} {selectedDriver.lastName}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-zinc-500">Email:</span>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200">{selectedDriver.email}</div>
                </div>
                <div>
                  <span className="font-semibold text-zinc-500">Driving License:</span>
                  <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedDriver.drivingLicenseNumber}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-zinc-500">College Verified:</span>
                  <div>
                    {selectedDriver.collegeVerified ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified Student
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Pending OTP</span>
                    )}
                  </div>
                </div>
              </div>

              {/* License Document Preview */}
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Driving License Document
                </h4>
                {selectedDriver.licenseImageUrl ? (
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-950 p-2 max-h-56 flex items-center justify-center">
                    <img
                      src={`http://localhost:8081/${selectedDriver.licenseImageUrl}`}
                      alt="Driving License"
                      className="max-h-52 object-contain rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                    No license image uploaded
                  </div>
                )}
              </div>

              {/* Vehicle Details */}
              {selectedDriver.vehicle && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Car className="h-4 w-4 text-zinc-600" />
                    <span>Registered Vehicle</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-zinc-500">Type:</span>{" "}
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedDriver.vehicle.vehicleType}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Model:</span>{" "}
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedDriver.vehicle.brand} {selectedDriver.vehicle.model}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Plate:</span>{" "}
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedDriver.vehicle.registrationNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Capacity:</span>{" "}
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedDriver.vehicle.maxPassengerCapacity} Seats
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-end gap-3">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setRejectModalOpen(true)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="text-xs"
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                <span>Reject Application</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => approveMutation.mutate(selectedDriver.driverId)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                <span>{approveMutation.isPending ? "Approving..." : "Approve Application"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Rejection Reason Modal ─── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Reject Application Reason
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Provide a clear reason for rejecting this student's driver application.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Unclear driving license photograph or invalid vehicle registration number."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  rejectMutation.mutate({
                    driverId: selectedDriver.driverId,
                    reason: rejectionReason,
                  })
                }
                disabled={rejectMutation.isPending}
                className="text-xs"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
