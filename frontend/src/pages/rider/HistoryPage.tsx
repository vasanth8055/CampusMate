import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowLeft,
  XCircle,
} from "lucide-react";

import { getMyBookingsWithTrips } from "@/features/booking/api/booking.api";
import { RideCompletedModal } from "@/features/trip/components/RideCompletedModal";
import { formatDateTime } from "@/utils/format";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [selectedCompletedTrip, setSelectedCompletedTrip] = useState<any | null>(null);

  const { data: bookingTripPairs, isLoading, isError, refetch } = useQuery({
    queryKey: ["bookings", "me", "history"],
    queryFn: getMyBookingsWithTrips,
    staleTime: 1000 * 5,
    refetchInterval: 5000,
    retry: 1,
  });

  const historyBookings = useMemo(
    () =>
      (bookingTripPairs ?? []).filter(
        ({ booking }) =>
          booking.status === "COMPLETED" ||
          booking.status === "CANCELLED" ||
          booking.status === "REJECTED"
      ),
    [bookingTripPairs]
  );

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-4xl space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            Trip History
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Review your past commutes & receipts
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-foreground-secondary animate-pulse space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div>Loading your commute history...</div>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-danger/30 bg-danger-subtle/30 p-6 text-center space-y-3">
          <XCircle className="h-8 w-8 text-danger mx-auto" />
          <div className="font-bold text-sm text-foreground">
            Unable to load history
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft"
          >
            Retry
          </button>
        </div>
      ) : historyBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center shadow-soft space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">No past rides</div>
            <p className="text-xs text-foreground-secondary mt-1 max-w-[240px]">
              Once you complete campus rides, receipts and ratings will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {historyBookings.map(({ booking, trip }) => {
            const isCompleted = booking.status === "COMPLETED";

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-border bg-surface p-4 shadow-soft hover:shadow-medium transition space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-surface-subtle text-foreground-secondary border border-border"
                    }`}
                  >
                    {booking.status}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {formatDateTime(trip?.departureTime)}
                  </span>
                </div>

                <div className="space-y-2 border-y border-border-subtle py-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary ring-2 ring-primary-subtle"></div>
                    <div className="font-semibold text-foreground truncate">
                      {trip?.source || "Pickup Point"}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-1 h-2 w-2 rounded-full bg-secondary ring-2 ring-secondary-subtle"></div>
                    <div className="font-semibold text-foreground truncate">
                      {trip?.destination || "Dropoff Destination"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-foreground-secondary font-medium">
                    {trip?.driver
                      ? `Driver: ${trip.driver.firstName} ${trip.driver.lastName}`
                      : "Campus Host"}
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => setSelectedCompletedTrip(trip)}
                        className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
                      >
                        Rate Ride
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate(`/trips/${booking.tripId}`)}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating modal */}
      {selectedCompletedTrip && (
        <RideCompletedModal
          isOpen={Boolean(selectedCompletedTrip)}
          onClose={() => setSelectedCompletedTrip(null)}
          tripSummary={{
            driverName: selectedCompletedTrip.driver
              ? `${selectedCompletedTrip.driver.firstName} ${selectedCompletedTrip.driver.lastName}`.trim()
              : "Campus Driver",

            source: selectedCompletedTrip.source,
            destination: selectedCompletedTrip.destination,
            fare: selectedCompletedTrip.price,
          }}
          onSubmitFeedback={(rating) => {
            toast.success(`Thank you for rating ${rating} stars!`);
            setSelectedCompletedTrip(null);
          }}
        />
      )}
    </div>
  );
}
