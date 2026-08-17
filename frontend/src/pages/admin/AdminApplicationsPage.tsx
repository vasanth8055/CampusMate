import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileCheck,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  Car,
  Bike,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  getAdminDrivers,
  approveAdminDriver,
  rejectAdminDriver,
} from "@/features/admin/api/admin.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminApplicationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: driversRes, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "drivers"],
    queryFn: () => getAdminDrivers(),
    staleTime: 1000 * 15,
  });

  const drivers = useMemo(() => {
    return Array.isArray(driversRes?.data) ? driversRes.data : [];
  }, [driversRes]);

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (driverId: string) => approveAdminDriver(driverId),
    onSuccess: () => {
      toast.success("Driver application approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setSelectedDriver(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to approve driver");
    },
  });

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

  // Tab counts
  const pendingCount = drivers.filter(
    (d: any) =>
      d &&
      (d.status === "PENDING" ||
        d.status === "LICENSE_UPLOADED" ||
        d.status === "UNDER_REVIEW")
  ).length;

  const approvedCount = drivers.filter((d: any) => d && d.status === "APPROVED").length;
  const rejectedCount = drivers.filter(
    (d: any) => d && (d.status === "REJECTED" || d.status === "SUSPENDED")
  ).length;

  // Filtered by tab and search
  const displayedDrivers = useMemo(() => {
    return drivers.filter((d: any) => {
      if (!d) return false;
      let matchesTab = false;
      if (activeTab === "PENDING") {
        matchesTab =
          d.status === "PENDING" ||
          d.status === "LICENSE_UPLOADED" ||
          d.status === "UNDER_REVIEW";
      } else if (activeTab === "APPROVED") {
        matchesTab = d.status === "APPROVED";
      } else {
        matchesTab = d.status === "REJECTED" || d.status === "SUSPENDED";
      }

      const firstName = String(d.firstName || "");
      const lastName = String(d.lastName || "");
      const email = String(d.email || "");
      const dl = String(d.drivingLicenseNumber || "");
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        q === "" ||
        `${firstName} ${lastName}`.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        dl.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [drivers, activeTab, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Driver Applications
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Review and process incoming driver applications from students.
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
            onClick={() =>
              window.open("http://localhost:8080/api/v1/admin/reports/export/drivers", "_blank")
            }
            className="flex items-center gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ─── Error Alert ─── */}
      {isError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>Unable to load applications queue. {(error as any)?.message || "Service unavailable."}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* ─── Filter Tabs & Search Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-fit shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "PENDING"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === "PENDING" ? "bg-amber-400 text-zinc-900" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("APPROVED")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "APPROVED"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <span>Approved</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                activeTab === "APPROVED" ? "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {approvedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("REJECTED")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "REJECTED"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <span>Rejected</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                activeTab === "REJECTED" ? "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {rejectedCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicants, DL..."
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* ─── Applications Table ─── */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
            <span>Loading applications queue...</span>
          </div>
        ) : displayedDrivers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileCheck className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No applications in this view</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              There are currently no driver applications matching your selected tab.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">College / University</th>
                  <th className="py-3 px-4">Vehicle Details</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {displayedDrivers.map((d: any) => {
                  const submittedDate = d.createdAt
                    ? new Date(d.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Aug 2026";

                  return (
                    <tr key={d.driverId} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                      {/* Applicant Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                            {d.firstName?.[0] || "D"}
                            {d.lastName?.[0] || ""}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                              {d.firstName} {d.lastName}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                              DL: {d.drivingLicenseNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* College */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            {d.collegeName || "Siddhartha Academy"}
                          </span>
                          {d.collegeVerified && (
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {d.vehicle ? (
                          <div className="flex items-center gap-1.5">
                            {d.vehicle.vehicleType === "BIKE" || d.vehicle.vehicleType === "SCOOTER" ? (
                              <Bike className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                            ) : (
                              <Car className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                            )}
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">
                              {d.vehicle.brand} {d.vehicle.model}
                            </span>
                            <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                              {d.vehicle.registrationNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">No vehicle</span>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-[11px]">
                        {submittedDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            d.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200"
                              : d.status === "REJECTED"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedDriver(d)}
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

      {/* ─── Review Modal ─── */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Review Driver Application
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Verify applicant identity, college standing, and vehicle
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
                    <Car className="h-4 w-4 text-zinc-500" />
                    <span>Vehicle Information</span>
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
              Provide a clear explanation for the rejection.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete license document."
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
