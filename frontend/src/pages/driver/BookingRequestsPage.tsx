import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarRange,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";


import {
  getDriverBookingsWithDetails,
  acceptBooking,
  rejectBooking,
} from "@/features/booking/api/booking.api";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate, formatTime } from "@/utils/format";
import { getStatusBadgeClass, getStatusLabel } from "@/utils/status";

export default function BookingRequestsPage() {
  const qc = useQueryClient();

  const { data, refetch, isLoading, isFetching } = useQuery({
    queryKey: ["driver", "bookings"],
    queryFn: getDriverBookingsWithDetails,
    staleTime: 1000 * 5,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const bookings = data ?? [];

  const acceptMut = useMutation({
    mutationFn: (id: string) => acceptBooking(id),
    onSuccess: () => {
      toast.success("Booking request accepted.");
      qc.invalidateQueries({ queryKey: ["driver", "bookings"] });
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not accept request.");
    },
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectBooking(id),
    onSuccess: () => {
      toast.success("Booking request declined.");
      qc.invalidateQueries({ queryKey: ["driver", "bookings"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not decline request.");
    },
  });

  // Auto-refresh periodically
  useEffect(() => {
    const interval = setInterval(() => refetch(), 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-4xl space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Booking Requests
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Review and respond to passenger ride requests.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-3xl border border-border bg-surface p-12 text-center text-xs text-foreground-secondary">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
            Loading booking requests...
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
              <CalendarRange className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              No booking requests
            </h3>
            <p className="text-xs text-foreground-secondary max-w-xs mx-auto">
              When riders request seats on your trips, they will appear here for your confirmation.
            </p>
          </div>
        ) : (
          bookings.map(({ booking: b, trip: t, rider: r }) => {
            const isPending = b.status === "REQUESTED" || (b.status as any) === "PENDING";

            const riderName = r
              ? `${r.firstName || ""} ${r.lastName || ""}`.trim() || "Student Passenger"
              : "Student Passenger";
            const dateStr = formatDate(t?.departureTime || b.bookingTime);
            const timeStr = formatTime(t?.departureTime || b.bookingTime);
            const unitFare = Number(t?.price || 40);
            const totalFare = unitFare * Number(b.requestedSeats || 1);

            return (
              <div
                key={b.id}
                className="rounded-3xl border border-border bg-surface p-5 shadow-soft transition hover:shadow-medium space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary font-extrabold text-sm">
                      {riderName[0] || "R"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-foreground">
                          {riderName}
                        </span>
                        <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold flex items-center gap-0.5">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      </div>
                      <div className="text-xs text-foreground-secondary mt-0.5">
                        {r?.email || "Student Passenger"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${getStatusBadgeClass(
                        b.status
                      )}`}
                    >
                      {getStatusLabel(b.status)}
                    </span>
                  </div>
                </div>

                {/* Route & Schedule */}
                {t && (
                  <div className="space-y-2 bg-surface-subtle p-3.5 rounded-2xl text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <span className="font-bold text-foreground truncate">{t.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-bold text-foreground truncate">{t.destination}</span>
                    </div>
                    <div className="border-t border-border-subtle pt-2 flex items-center justify-between text-foreground-secondary font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span className="font-bold text-primary">{timeStr}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-surface-subtle p-3.5 rounded-2xl">
                  <div>
                    <span className="text-foreground-secondary block">
                      Requested Seats
                    </span>
                    <span className="font-bold text-foreground">
                      {b.requestedSeats} Seat{b.requestedSeats > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div>
                    <span className="text-foreground-secondary block">
                      Total Fare (₹)
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {formatCurrency(totalFare)}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-foreground-secondary block">
                      Rate per Seat
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(unitFare)} / seat
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {isPending && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => rejectMut.mutate(b.id)}
                      disabled={rejectMut.isPending}
                      className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-foreground-secondary hover:text-danger hover:bg-danger-subtle transition disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => acceptMut.mutate(b.id)}
                      disabled={acceptMut.isPending}
                      className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {acceptMut.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      <span>Accept Booking</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

