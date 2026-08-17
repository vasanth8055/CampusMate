import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Search,
  Download,
  Ban,
  RefreshCw,
  Eye,
  Navigation,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { getAdminTrips, cancelAdminTrip } from "@/features/admin/api/admin.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminTripsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);

  const { data: tripsRes, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "trips"],
    queryFn: () => getAdminTrips(),
    staleTime: 1000 * 15,
  });

  const trips = useMemo(() => {
    return Array.isArray(tripsRes?.data) ? tripsRes.data : [];
  }, [tripsRes]);

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (tripId: string) => cancelAdminTrip(tripId),
    onSuccess: () => {
      toast.success("Trip cancelled by administrator");
      queryClient.invalidateQueries({ queryKey: ["admin", "trips"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to cancel trip");
    },
  });

  const filteredTrips = useMemo(() => {
    return trips.filter((t: any) => {
      if (!t) return false;
      const tId = String(t.id || "");
      const source = String(t.source || "");
      const destination = String(t.destination || "");
      const driverId = String(t.driverId || "");
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        q === "" ||
        tId.toLowerCase().includes(q) ||
        source.toLowerCase().includes(q) ||
        destination.toLowerCase().includes(q) ||
        driverId.toLowerCase().includes(q);

      const status = String(t.status || "").toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [trips, searchQuery, statusFilter]);

  const handleExportCsv = () => {
    toast.info("Generating Trips CSV export...");
    window.open("http://localhost:8080/api/v1/admin/reports/export/trips", "_blank");
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "SCHEDULED").toUpperCase();
    if (s === "IN_PROGRESS") {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200";
    }
    if (s === "COMPLETED") {
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700";
    }
    if (s === "CANCELLED") {
      return "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200";
    }
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Trips & Commute Schedules
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Audit published student rides, route origins, destinations, fares, and cancellations.
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

      {/* ─── Error Alert ─── */}
      {isError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>Unable to load trips roster. {(error as any)?.message || "Service unavailable."}</span>
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
              placeholder="Search by route, origin, destination, or Trip ID..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none font-semibold"
            >
              <option value="ALL">All Trip Statuses ({trips.length})</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress (Live)</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ─── Trips Table ─── */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
            <span>Loading trips...</span>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <MapPin className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No trips found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Try adjusting your search criteria or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Trip ID</th>
                  <th className="py-3 px-4">Route (Origin ➔ Destination)</th>
                  <th className="py-3 px-4">Departure Time</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Fare / Seat</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredTrips.map((t: any) => {
                  const isScheduled = t.status === "SCHEDULED";
                  const departureDate = t.departureTime
                    ? new Date(t.departureTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Aug 2026";

                  return (
                    <tr key={t.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                          TRP-{String(t.id || "").slice(0, 8)}
                        </span>
                      </td>

                      {/* Route */}
                      <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-1.5">
                          <Navigation className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          <span>
                            {t.source} ➔ {t.destination}
                          </span>
                        </div>
                      </td>

                      {/* Departure */}
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{departureDate}</span>
                        </div>
                      </td>

                      {/* Seats */}
                      <td className="py-3.5 px-4 font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                        {t.availableSeats ?? 0} / {t.totalSeats ?? 1} Available
                      </td>

                      {/* Fare */}
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        ₹{t.farePerSeat || 0}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${getStatusBadge(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTrip(t)}
                            className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="View Trip Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {isScheduled && (
                            <button
                              type="button"
                              onClick={() => cancelMutation.mutate(t.id)}
                              disabled={cancelMutation.isPending}
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition inline-flex items-center gap-1"
                              title="Cancel Trip"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              <span>Cancel</span>
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

      {/* ─── Trip Details Modal ─── */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Trip TRP-{String(selectedTrip.id || "").slice(0, 8)}
                </h3>
                <span className="text-xs text-zinc-500">Commute itinerary details</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                <div className="text-zinc-500 font-semibold">Route:</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedTrip.source} ➔ {selectedTrip.destination}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-zinc-500 font-semibold">Available Seats:</div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {selectedTrip.availableSeats} / {selectedTrip.totalSeats}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-zinc-500 font-semibold">Fare Per Seat:</div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    ₹{selectedTrip.farePerSeat}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                <div className="text-zinc-500 font-semibold">Driver ID:</div>
                <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all mt-0.5">
                  {selectedTrip.driverId}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedTrip(null)}
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
