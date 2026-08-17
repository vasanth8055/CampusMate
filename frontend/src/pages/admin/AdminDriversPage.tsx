import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserCheck,
  Search,
  Download,
  Ban,
  CheckCircle2,
  RefreshCw,
  Eye,
  ShieldCheck,
  Car,
  Bike,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  getAdminDrivers,
  suspendAdminDriver,
  restoreAdminDriver,
} from "@/features/admin/api/admin.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminDriversPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  const { data: driversRes, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "drivers"],
    queryFn: () => getAdminDrivers(),
    staleTime: 1000 * 15,
  });

  const drivers = useMemo(() => {
    return Array.isArray(driversRes?.data) ? driversRes.data : [];
  }, [driversRes]);

  // Suspend mutation
  const suspendMutation = useMutation({
    mutationFn: (driverId: string) =>
      suspendAdminDriver(driverId, "Suspended by administrator"),
    onSuccess: () => {
      toast.success("Driver capability suspended");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to suspend driver");
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (driverId: string) => restoreAdminDriver(driverId),
    onSuccess: () => {
      toast.success("Driver capability restored");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to restore driver");
    },
  });

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d: any) => {
      if (!d) return false;
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

      const status = String(d.status || "").toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchQuery, statusFilter]);

  const handleExportCsv = () => {
    toast.info("Generating Drivers CSV export...");
    window.open("http://localhost:8080/api/v1/admin/reports/export/drivers", "_blank");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Drivers Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Audit approved drivers, license registrations, and operational permissions.
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
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ─── Error State ─── */}
      {isError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>Unable to load drivers list. {(error as any)?.message || "Service unavailable."}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* ─── Filters & Search ─── */}
      <Card className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or license number..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none font-semibold"
            >
              <option value="ALL">All Driver Statuses ({drivers.length})</option>
              <option value="APPROVED">Approved Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending Verification</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ─── Drivers Table ─── */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
            <span>Loading drivers roster...</span>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <UserCheck className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No drivers found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No registered drivers match your query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Driving License</th>
                  <th className="py-3 px-4">Active Vehicle</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredDrivers.map((d: any) => {
                  const isApproved = d.status === "APPROVED";
                  const isSuspended = d.status === "SUSPENDED";

                  return (
                    <tr key={d.driverId} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                      {/* Driver */}
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
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {d.email}
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

                      {/* DL */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        {d.drivingLicenseNumber}
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
                          <span className="text-zinc-400 italic">No active vehicle</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200"
                              : isSuspended
                              ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDriver(d)}
                            className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="View Driver Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={() => restoreMutation.mutate(d.driverId)}
                              disabled={restoreMutation.isPending}
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition inline-flex items-center gap-1"
                              title="Restore Driver"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => suspendMutation.mutate(d.driverId)}
                              disabled={suspendMutation.isPending}
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition inline-flex items-center gap-1"
                              title="Suspend Driver"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              <span>Suspend</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ─── Driver Quick View Modal ─── */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedDriver.firstName} {selectedDriver.lastName}
                </h3>
                <span className="text-xs text-zinc-500">
                  Driver profile & license record
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                <div className="text-zinc-500 font-semibold">Email:</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{selectedDriver.email}</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                <div className="text-zinc-500 font-semibold">Driving License Number:</div>
                <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {selectedDriver.drivingLicenseNumber}
                </div>
              </div>

              {selectedDriver.vehicle && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                  <div className="text-zinc-500 font-semibold">Registered Vehicle:</div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedDriver.vehicle.brand} {selectedDriver.vehicle.model} (
                    <span className="font-mono">{selectedDriver.vehicle.registrationNumber}</span>)
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedDriver(null)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
