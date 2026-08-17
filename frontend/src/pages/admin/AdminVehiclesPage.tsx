import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Car,
  Bike,
  Search,
  Download,
  CheckCircle2,
  Ban,
  RefreshCw,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  getAdminVehicles,
  deactivateAdminVehicle,
  reactivateAdminVehicle,
} from "@/features/admin/api/admin.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminVehiclesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const { data: vehiclesRes, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: getAdminVehicles,
    staleTime: 1000 * 15,
  });

  const vehicles = useMemo(() => {
    return Array.isArray(vehiclesRes?.data) ? vehiclesRes.data : [];
  }, [vehiclesRes]);

  // Mutations
  const deactivateMutation = useMutation({
    mutationFn: (vehicleId: string) => deactivateAdminVehicle(vehicleId),
    onSuccess: () => {
      toast.success("Vehicle deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to deactivate vehicle");
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (vehicleId: string) => reactivateAdminVehicle(vehicleId),
    onSuccess: () => {
      toast.success("Vehicle activated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to activate vehicle");
    },
  });

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v: any) => {
      if (!v) return false;
      const vId = String(v.id || v.vehicleId || "");
      const brand = String(v.brand || "");
      const model = String(v.model || "");
      const reg = String(v.registrationNumber || "");
      const driverId = String(v.driverId || "");
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        q === "" ||
        vId.toLowerCase().includes(q) ||
        `${brand} ${model}`.toLowerCase().includes(q) ||
        reg.toLowerCase().includes(q) ||
        driverId.toLowerCase().includes(q);

      const vType = String(v.vehicleType || "").toUpperCase();
      const matchesType =
        typeFilter === "ALL" || vType === typeFilter.toUpperCase();

      const status = String(v.status || "").toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter.toUpperCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, searchQuery, typeFilter, statusFilter]);

  const renderVehicleIcon = (type?: string) => {
    const t = (type || "").toUpperCase();
    if (t === "BIKE" || t === "SCOOTER") {
      return <Bike className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
    }
    return <Car className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Fleet & Vehicle Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Audit registered student bikes, scooters, cars, registration numbers, and RC status.
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
            <span>Export Fleet CSV</span>
          </Button>
        </div>
      </div>

      {/* ─── Error Alert ─── */}
      {isError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>Unable to load fleet vehicles. {(error as any)?.message || "Service unavailable."}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* ─── Filters & Search ─── */}
      <Card className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by model, brand, or plate..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none font-semibold"
            >
              <option value="ALL">All Vehicle Types</option>
              <option value="BIKE">Bike / Motorcycle</option>
              <option value="SCOOTER">Scooter / Scooty</option>
              <option value="CAR">Car / Sedan / Hatchback</option>
              <option value="AUTO">Auto / Shared Transit</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none font-semibold"
            >
              <option value="ALL">All Statuses ({vehicles.length})</option>
              <option value="ACTIVE">Active & Eligible</option>
              <option value="INACTIVE">Deactivated</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ─── Vehicles Table ─── */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
            <span>Loading fleet inventory...</span>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Car className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No vehicles found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No registered fleet vehicles match your filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Vehicle Model</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Registration Number</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Driver ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredVehicles.map((v: any) => {
                  const vId = v.id || v.vehicleId;
                  const isActive = v.status === "ACTIVE";

                  return (
                    <tr key={vId} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                      {/* Brand & Model */}
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {v.brand} {v.model}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {renderVehicleIcon(v.vehicleType)}
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {v.vehicleType}
                          </span>
                        </div>
                      </td>

                      {/* Reg Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                          {v.registrationNumber}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-zinc-800 dark:text-zinc-200">
                        {v.maxPassengerCapacity || 1} Passenger(s)
                      </td>

                      {/* Driver ID */}
                      <td className="py-3.5 px-4 font-mono text-zinc-500 whitespace-nowrap">
                        {String(v.driverId || "").slice(0, 10)}...
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200"
                              : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200"
                          }`}
                        >
                          {v.status || "ACTIVE"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedVehicle(v)}
                            className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="View Vehicle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => deactivateMutation.mutate(vId)}
                              disabled={deactivateMutation.isPending}
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition inline-flex items-center gap-1"
                              title="Deactivate Vehicle"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => reactivateMutation.mutate(vId)}
                              disabled={reactivateMutation.isPending}
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition inline-flex items-center gap-1"
                              title="Activate Vehicle"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Activate</span>
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

      {/* ─── Vehicle Quick View Modal ─── */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </h3>
                <span className="text-xs text-zinc-500">
                  Fleet registration record
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                <div className="text-zinc-500 font-semibold">Registration Number:</div>
                <div className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {selectedVehicle.registrationNumber}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-zinc-500 font-semibold">Vehicle Type:</div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {selectedVehicle.vehicleType}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-zinc-500 font-semibold">Max Capacity:</div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {selectedVehicle.maxPassengerCapacity || 1} Seat(s)
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                <div className="text-zinc-500 font-semibold">Driver ID:</div>
                <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all mt-0.5">
                  {selectedVehicle.driverId}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedVehicle(null)}
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
