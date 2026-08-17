import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Ticket,
  Search,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { getAdminBookings } from "@/features/admin/api/admin.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const {
    data: bookingsRes,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: getAdminBookings,
    staleTime: 1000 * 15,
  });

  const bookings = useMemo(() => {
    return Array.isArray(bookingsRes?.data) ? bookingsRes.data : [];
  }, [bookingsRes]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b: any) => {
      if (!b) return false;
      const bkgId = String(b.bookingId || b.id || "");
      const riderId = String(b.riderId || "");
      const driverId = String(b.driverId || "");
      const tripId = String(b.tripId || "");
      const riderName = String(b.riderName || "");
      const driverName = String(b.driverName || "");

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        bkgId.toLowerCase().includes(q) ||
        riderId.toLowerCase().includes(q) ||
        driverId.toLowerCase().includes(q) ||
        tripId.toLowerCase().includes(q) ||
        riderName.toLowerCase().includes(q) ||
        driverName.toLowerCase().includes(q);

      const status = String(b.status || "").toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const handleExportCsv = () => {
    toast.info("Generating Bookings CSV export...");
    window.open("http://localhost:8080/api/v1/admin/reports/export/bookings", "_blank");
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "REQUESTED").toUpperCase();
    if (s === "ACCEPTED" || s === "CONFIRMED") {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60";
    }
    if (s === "COMPLETED") {
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700";
    }
    if (s === "REJECTED" || s === "CANCELLED") {
      return "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800/60";
    }
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Seat Bookings & Passenger Ledgers
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Audit seat reservations, fare splits, timestamps, and passenger records.
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

      {/* ─── Error State Banner ─── */}
      {isError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>
              Unable to load live bookings. {(error as any)?.message || "Service unavailable."}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs py-1 px-3 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
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
              placeholder="Search by Booking ID, Rider, Driver, or Trip ID..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none font-semibold"
            >
              <option value="ALL">All Booking Statuses ({bookings.length})</option>
              <option value="REQUESTED">Requested / Pending</option>
              <option value="ACCEPTED">Accepted / Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ─── Bookings Table ─── */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
            <span>Loading seat bookings...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Ticket className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              0 bookings found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {searchQuery || statusFilter !== "ALL"
                ? "No bookings match your selected filter criteria."
                : "No passenger seat reservations recorded in the system yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Rider</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Fare</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredBookings.map((b: any, idx: number) => {
                  const bkgId = String(b.bookingId || b.id || `BKG-${idx}`);
                  const riderId = String(b.riderId || "N/A");
                  const driverId = String(b.driverId || "N/A");
                  const seats = b.seatsBooked ?? b.requestedSeats ?? 1;
                  const fare = b.totalFare ?? 0;
                  const status = b.status || "REQUESTED";
                  const createdAt = b.createdAt || b.bookingTime;
                  const dateStr = createdAt
                    ? new Date(createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recent";

                  return (
                    <tr
                      key={bkgId}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition"
                    >
                      {/* Booking ID */}
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                          BKG-{bkgId.slice(0, 8)}
                        </span>
                      </td>

                      {/* Rider */}
                      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {b.riderName || `Rider ${riderId.slice(0, 6)}`}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                          {riderId.slice(0, 10)}...
                        </div>
                      </td>

                      {/* Driver */}
                      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {b.driverName || `Driver ${driverId.slice(0, 6)}`}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                          {driverId.slice(0, 10)}...
                        </div>
                      </td>

                      {/* Seats */}
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        {seats} Seat{seats > 1 ? "s" : ""}
                      </td>

                      {/* Fare */}
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        ₹{fare}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${getStatusBadge(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-[11px]">
                        {dateStr}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
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

      {/* ─── Booking Details Modal ─── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Booking BKG-
                  {String(selectedBooking.bookingId || selectedBooking.id || "").slice(0, 8)}
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Passenger reservation record
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                <div className="text-zinc-500 dark:text-zinc-400 font-semibold">
                  Trip Reference ID:
                </div>
                <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 break-all">
                  {selectedBooking.tripId || "N/A"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-zinc-500 dark:text-zinc-400 font-semibold">
                    Rider ID:
                  </div>
                  <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                    {selectedBooking.riderId || "N/A"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-zinc-500 dark:text-zinc-400 font-semibold">
                    Driver ID:
                  </div>
                  <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                    {selectedBooking.driverId || "N/A"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-zinc-500 dark:text-zinc-400 font-semibold">
                    Seats Reserved:
                  </div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {selectedBooking.seatsBooked ?? selectedBooking.requestedSeats ?? 1} Seat(s)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-zinc-500 dark:text-zinc-400 font-semibold">
                    Total Fare:
                  </div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    ₹{selectedBooking.totalFare || 0}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400 font-semibold">Status:</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${getStatusBadge(
                    selectedBooking.status
                  )}`}
                >
                  {selectedBooking.status || "REQUESTED"}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedBooking(null)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-semibold text-xs"
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
