import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  Car,
  MapPin,
  XCircle,
  Navigation,
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  getMyBookingsWithTrips,
  cancelBooking,
} from "@/features/booking/api/booking.api";
import { getUnreadCount } from "@/features/notification/api/notification.api";
import { RideCompletedModal } from "@/features/trip/components/RideCompletedModal";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { getStatusBadgeClass, getStatusLabel } from "@/utils/status";

export default function BookingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED">("UPCOMING");
  const [selectedCompletedTrip, setSelectedCompletedTrip] = useState<any | null>(null);

  // Load bookings
  const {
    data: bookingTripPairs,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["bookings", "me", "withTrips"],
    queryFn: getMyBookingsWithTrips,
    staleTime: 1000 * 5,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Load unread notification count
  const { data: unreadRes } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    staleTime: 1000 * 5,
    refetchInterval: 5000,
  });
  const unreadCount = unreadRes?.data?.count ?? 0;

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      toast.success("Booking cancelled successfully.");
      refetch();
    },
    onError: () => {
      toast.error("Could not cancel booking. Please try again.");
    },
  });

  const bookingsList = bookingTripPairs ?? [];

  // Filter lists
  const upcomingBookings = useMemo(
    () =>
      bookingsList.filter(
        ({ booking }) =>
          booking.status === "REQUESTED" ||
          booking.status === "ACCEPTED" ||
          booking.status === "CONFIRMED"
      ),
    [bookingsList]
  );

  const activeBookings = useMemo(
    () => bookingsList.filter(({ booking }) => booking.status === "ONGOING"),
    [bookingsList]
  );

  const completedBookings = useMemo(
    () => bookingsList.filter(({ booking }) => booking.status === "COMPLETED"),
    [bookingsList]
  );

  const cancelledBookings = useMemo(
    () =>
      bookingsList.filter(
        ({ booking }) =>
          booking.status === "CANCELLED" || booking.status === "REJECTED"
      ),
    [bookingsList]
  );

  const displayedList = useMemo(() => {
    switch (activeTab) {
      case "UPCOMING":
        return upcomingBookings;
      case "ACTIVE":
        return activeBookings;
      case "COMPLETED":
        return completedBookings;
      case "CANCELLED":
        return cancelledBookings;
      default:
        return upcomingBookings;
    }
  }, [activeTab, upcomingBookings, activeBookings, completedBookings, cancelledBookings]);

  const firstName = user?.firstName || "Rider";

  const formatSchedule = (iso?: string) => {
    if (!iso) return "Scheduled Time";
    return formatDateTime(iso);
  };

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-4xl space-y-5 animate-in fade-in duration-300">
      {/* ─── Header (Stitch UI My Rides) ─── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            Welcome, {firstName}
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Manage your campus commutes & bookings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle text-primary font-bold shadow-soft ring-2 ring-primary/20"
          >
            {firstName[0]}
          </Link>

          <Link
            to="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white ring-2 ring-surface">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ─── Filter Tabs (Upcoming, Active, Completed, Cancelled) ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "UPCOMING", label: "Upcoming", count: upcomingBookings.length },
          { id: "ACTIVE", label: "Active", count: activeBookings.length },
          { id: "COMPLETED", label: "Completed", count: completedBookings.length },
          { id: "CANCELLED", label: "Cancelled", count: cancelledBookings.length },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                isSelected
                  ? "bg-primary text-white shadow-soft"
                  : "bg-surface-subtle text-foreground-secondary border border-border hover:bg-surface hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    isSelected ? "bg-white/20 text-white" : "bg-border text-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Rides List ─── */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-foreground-secondary animate-pulse space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div>Loading your commutes...</div>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-danger/30 bg-danger-subtle/30 p-6 text-center space-y-3">
          <XCircle className="h-8 w-8 text-danger mx-auto" />
          <div className="font-bold text-sm text-foreground">
            Unable to load rides
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft"
          >
            Retry
          </button>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center shadow-soft space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <Car className="h-7 w-7" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">
              No {activeTab.toLowerCase()} rides
            </div>
            <p className="text-xs text-foreground-secondary mt-1 max-w-[240px]">
              {activeTab === "UPCOMING"
                ? "You have no upcoming rides scheduled. Search to find a ride."
                : `You have no ${activeTab.toLowerCase()} rides in your history.`}
            </p>
          </div>
          {activeTab === "UPCOMING" && (
            <button
              type="button"
              onClick={() => navigate("/find-rides")}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
            >
              Find Rides
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map(({ booking, trip }) => {
            const status = booking.status;
            const isRequested = status === "REQUESTED";
            const isAccepted = status === "ACCEPTED" || status === "CONFIRMED";
            const isActive = status === "ONGOING";
            const isCompleted = status === "COMPLETED";

            const numPrice = Number(trip?.price) || 40;

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-border bg-surface p-4 shadow-soft hover:shadow-medium hover:border-primary/40 transition space-y-4"
              >
                {/* Header Status & Time */}
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStatusBadgeClass(
                      status
                    )}`}
                  >
                    {getStatusLabel(status)}
                  </span>

                  <span className="text-xs font-extrabold text-foreground">
                    {formatSchedule(trip?.departureTime)}
                  </span>
                </div>

                {/* Timeline Stops (Stitch UI) */}
                <div className="space-y-3 border-y border-border-subtle py-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white shadow-soft">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-foreground truncate">
                        {trip?.source || "Pickup Location"}
                      </div>
                      <div className="text-[11px] text-foreground-secondary truncate mt-0.5">
                        Campus Pickup Zone
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-secondary text-white shadow-soft">
                      <MapPin className="h-2.5 w-2.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-foreground truncate">
                        {trip?.destination || "Destination"}
                      </div>
                      <div className="text-[11px] text-foreground-secondary truncate mt-0.5">
                        Campus Drop-off Zone
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Info & Price */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-subtle text-primary font-bold text-xs">
                      {trip?.driver?.firstName?.[0] || "D"}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">
                        {trip?.driver
                          ? `${trip.driver.firstName} ${trip.driver.lastName}`
                          : "Campus Driver"}
                      </div>
                      <div className="text-[10px] text-foreground-secondary">
                        {trip?.vehicle ? `${trip.vehicle.brand} ${trip.vehicle.model}` : "Verified Vehicle"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-primary">
                      {formatCurrency(trip?.price || numPrice)}
                    </div>
                    <div className="text-[10px] text-foreground-secondary">
                      {booking.requestedSeats} seat{booking.requestedSeats > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2.5 pt-1">
                  {isRequested ? (
                    <>
                      <button
                        type="button"
                        onClick={() => cancelMutation.mutate(booking.id)}
                        disabled={cancelMutation.isPending}
                        className="flex-1 rounded-xl border border-rose-200 text-rose-600 dark:border-rose-900/50 dark:text-rose-400 py-2.5 px-3 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition active:scale-95 disabled:opacity-50"
                      >
                        Cancel Request
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/trips/${booking.tripId}`)}
                        className="flex-1 rounded-xl bg-primary py-2.5 px-3 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition active:scale-95 text-center"
                      >
                        View Details
                      </button>
                    </>
                  ) : isAccepted ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Cancel this confirmed ride booking?")) {
                            cancelMutation.mutate(booking.id);
                          }
                        }}
                        disabled={cancelMutation.isPending}
                        className="flex-1 rounded-xl border border-rose-200 text-rose-600 dark:border-rose-900/50 dark:text-rose-400 py-2.5 px-3 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition active:scale-95 disabled:opacity-50"
                      >
                        Cancel Ride
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/trips/${booking.tripId}`)}
                        className="flex-1 rounded-xl bg-primary py-2.5 px-3 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition active:scale-95 text-center"
                      >
                        View Details
                      </button>
                    </>
                  ) : isActive ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/track/${booking.tripId}`)}
                      className="w-full rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-medium hover:bg-emerald-700 transition active:scale-95 text-center flex items-center justify-center gap-2"
                    >
                      <Navigation className="h-4 w-4 animate-bounce" />
                      <span>Live Track Driver</span>
                    </button>
                  ) : isCompleted ? (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate(`/trips/${booking.tripId}`)}
                        className="flex-1 rounded-xl border border-border bg-surface py-2.5 px-3 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCompletedTrip(trip)}
                        className="flex-1 rounded-xl bg-primary py-2.5 px-3 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
                      >
                        Rate Driver
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate("/find-rides")}
                      className="w-full rounded-xl border border-border bg-surface py-2.5 px-4 text-xs font-bold text-primary hover:bg-surface-subtle transition"
                    >
                      Find Another Ride
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ride Completed / Rating modal */}
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
            toast.success(`Rated ${rating} stars. Thank you!`);
            setSelectedCompletedTrip(null);
          }}
        />
      )}
    </div>
  );
}
