import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Car,
  Bike,
  Plus,
  Calendar,
  ChevronRight,
  Users,
  Loader2,
  Play,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getMyTrips, startTrip, completeTrip } from "@/features/trip/api/trip.api";
import {
  getDriverBookingsWithDetails,
  acceptBooking,
  rejectBooking,
} from "@/features/booking/api/booking.api";
import { getMyVehicle } from "@/features/driver/vehicle/api/vehicle.api";
import { formatCurrency, formatDateTime, formatDate, formatTime } from "@/utils/format";
import { getStatusBadgeClass, getStatusLabel } from "@/utils/status";

export default function DriverDashboardPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [isOnline, setIsOnline] = useState(true);

  // Queries (with 5-second polling for real-time driver updates)
  const { data: tripsRes, isLoading: tripsLoading } = useQuery({
    queryKey: ["driver", "my-trips"],
    queryFn: getMyTrips,
    staleTime: 1000 * 5,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const { data: bookingDetails, isLoading: bookingsLoading } = useQuery({
    queryKey: ["driver", "bookings"],
    queryFn: getDriverBookingsWithDetails,
    staleTime: 1000 * 5,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const { data: vehicleRes } = useQuery({
    queryKey: ["driver", "vehicle", "me"],
    queryFn: getMyVehicle,
    staleTime: 1000 * 60 * 2,
  });

  const trips = tripsRes?.data ?? [];
  const bookings = bookingDetails ?? [];
  const vehicle = vehicleRes?.data;

  // Next upcoming or active trip (IN_PROGRESS first, then nearest future SCHEDULED trip)
  const nextTrip = useMemo(() => {
    // 1. IN_PROGRESS trip takes top priority as the active trip
    const liveTrip = trips.find((t) => t.status === "IN_PROGRESS");
    if (liveTrip) return liveTrip;

    // 2. Future SCHEDULED trips: only those whose scheduled departure has not elapsed
    const now = Date.now();
    const scheduledFuture = trips
      .filter((t) => {
        if (t.status !== "SCHEDULED" || !t.departureTime) return false;
        const depTime = new Date(t.departureTime).getTime();
        return depTime > now - 30 * 60 * 1000;
      })
      .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());

    return scheduledFuture[0] || null;
  }, [trips]);

  // Confirmed passengers for the active / next trip
  const confirmedPassengers = useMemo(() => {
    if (!nextTrip) return [];
    return bookings.filter(
      ({ booking }) =>
        booking.tripId === nextTrip.id &&
        (booking.status === "ACCEPTED" ||
          booking.status === "CONFIRMED" ||
          booking.status === "ONGOING")
    );
  }, [nextTrip, bookings]);

  // Pending booking requests
  const pendingRequests = useMemo(
    () =>
      bookings.filter(
        ({ booking }) =>
          booking.status === "REQUESTED" || (booking.status as any) === "PENDING"
      ),
    [bookings]
  );

  // Booking Mutations
  const acceptMutation = useMutation({
    mutationFn: (bookingId: string) => acceptBooking(bookingId),
    onSuccess: () => {
      toast.success("Booking request accepted.");
      qc.invalidateQueries({ queryKey: ["driver", "bookings"] });
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      qc.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not accept booking.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (bookingId: string) => rejectBooking(bookingId),
    onSuccess: () => {
      toast.success("Booking request declined.");
      qc.invalidateQueries({ queryKey: ["driver", "bookings"] });
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      qc.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not decline booking.");
    },
  });

  // Trip Lifecycle Mutations (Directly callable from Start Trip Card)
  const startTripMutation = useMutation({
    mutationFn: (tripId: string) => startTrip(tripId),
    onSuccess: () => {
      toast.success("Trip started! Live GPS tracking active.");
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      qc.invalidateQueries({ queryKey: ["driver", "bookings"] });
      qc.invalidateQueries({ queryKey: ["trips"] });
      if (nextTrip) {
        navigate(`/driver/trips/${nextTrip.id}`);
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not start trip.");
    },
  });

  const completeTripMutation = useMutation({
    mutationFn: (tripId: string) => completeTrip(tripId),
    onSuccess: () => {
      toast.success("Trip completed successfully! Safe commute.");
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      qc.invalidateQueries({ queryKey: ["driver", "bookings"] });
      qc.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not complete trip.");
    },
  });

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-4xl space-y-6 animate-in fade-in duration-300">
      {/* ─── Top Welcome & Status Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Driver Dashboard
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Welcome back, {user?.firstName || "Driver"}. Manage your campus commutes.
          </p>
        </div>

        {/* Online / Offline Status Toggle */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setIsOnline(!isOnline);
              toast.info(
                isOnline
                  ? "Driver mode paused (Offline)"
                  : "You are now online and ready for rides"
              );
            }}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold border transition shadow-soft ${
              isOnline
                ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-border bg-surface text-foreground-secondary"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isOnline ? "bg-emerald-500 animate-pulse" : "bg-foreground-muted"
              }`}
            />
            <span>{isOnline ? "Online • Ready" : "Offline"}</span>
          </button>
        </div>
      </div>

      {/* ─── Primary CTA: + OFFER A RIDE ─── */}
      <button
        type="button"
        onClick={() => navigate("/driver/trips/create")}
        className="group relative w-full overflow-hidden rounded-3xl bg-primary py-4 px-6 text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99] flex items-center justify-center gap-3 font-extrabold text-base tracking-wide"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
          <Plus className="h-5 w-5" />
        </div>
        <span>OFFER A RIDE</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Start Trip / Active Commute Card & Pending Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* ─── SERVER-AUTHORITATIVE START TRIP / ACTIVE RIDE CARD ─── */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-foreground">
                  {nextTrip?.status === "IN_PROGRESS"
                    ? "Active Commute"
                    : confirmedPassengers.length > 0
                    ? "Next Ride • Ready to Start"
                    : "Upcoming Trip"}
                </span>
              </div>
              {nextTrip && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${
                    nextTrip.status === "IN_PROGRESS"
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 animate-pulse"
                      : confirmedPassengers.length > 0
                      ? "bg-primary-subtle text-primary"
                      : "bg-surface-subtle text-foreground-secondary border border-border"
                  }`}
                >
                  {nextTrip.status === "IN_PROGRESS"
                    ? "• Live In Progress"
                    : confirmedPassengers.length > 0
                    ? "Confirmed"
                    : "Scheduled"}
                </span>
              )}
            </div>

            {tripsLoading ? (
              <div className="py-8 text-center text-xs text-foreground-secondary">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary mb-2" />
                Loading your trips...
              </div>
            ) : !nextTrip ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-2">
                <p className="text-xs font-semibold text-foreground-secondary">
                  No upcoming trips scheduled.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/driver/trips/create")}
                  className="text-xs font-extrabold text-primary hover:underline"
                >
                  Create a new trip schedule →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Date & Time Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTime(nextTrip.departureTime)}</span>
                  </div>
                  {vehicle && (
                    <div className="text-[11px] font-semibold text-foreground-secondary">
                      {vehicle.brand} {vehicle.model}
                    </div>
                  )}
                </div>

                {/* Route Visualizer */}
                <div className="space-y-2 bg-surface-subtle p-3.5 rounded-2xl border border-border-subtle">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-primary/20 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase font-bold text-foreground-muted">Pickup Location</div>
                      <div className="text-xs font-bold text-foreground truncate">{nextTrip.source}</div>
                    </div>
                  </div>
                  <div className="ml-1 border-l-2 border-dashed border-border pl-4 py-0.5" />
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase font-bold text-foreground-muted">Destination College</div>
                      <div className="text-xs font-bold text-foreground truncate">{nextTrip.destination}</div>
                    </div>
                  </div>
                </div>

                {/* ─── REAL CONFIRMED PASSENGERS SECTION ─── */}
                {confirmedPassengers.length > 0 ? (
                  <div className="space-y-2.5 rounded-2xl bg-primary-subtle/30 border border-primary/20 p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <div className="flex items-center gap-1.5 text-primary">
                        <Users className="h-3.5 w-3.5" />
                        <span>Confirmed Passengers ({confirmedPassengers.length})</span>
                      </div>
                      <span className="text-[11px] text-foreground-secondary">
                        {nextTrip.availableSeats} seat{nextTrip.availableSeats !== 1 ? "s" : ""} remaining
                      </span>
                    </div>

                    <div className="space-y-2">
                      {confirmedPassengers.map(({ booking: b, rider: r }) => {
                        const riderName = r
                          ? `${r.firstName || ""} ${r.lastName || ""}`.trim() || "Student Passenger"
                          : "Student Passenger";
                        const seatsCount = b.requestedSeats || 1;
                        const fareAmount = Number(nextTrip.price || 40) * seatsCount;

                        return (
                          <div
                            key={b.id}
                            className="flex items-center justify-between rounded-xl bg-surface p-2.5 border border-border text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-xs">
                                {riderName[0] || "P"}
                              </div>
                              <div>
                                <div className="font-bold text-foreground">{riderName}</div>
                                <div className="text-[10px] text-foreground-secondary">
                                  {seatsCount} seat{seatsCount > 1 ? "s" : ""} •{" "}
                                  <span className="font-bold text-primary">{formatCurrency(fareAmount)}</span>
                                </div>
                              </div>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(b.status)}`}>
                              {getStatusLabel(b.status)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-1 text-xs text-foreground-secondary">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span>{nextTrip.availableSeats} seats left</span>
                    </div>
                    <span className="font-bold text-foreground">
                      {formatCurrency(nextTrip.price)} / seat
                    </span>
                  </div>
                )}

                {/* ─── ACTION BUTTONS (START TRIP / IN PROGRESS / MANAGE) ─── */}
                <div className="pt-2">
                  {nextTrip.status === "IN_PROGRESS" ? (
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/driver/trips/${nextTrip.id}`)}
                        className="flex-1 rounded-2xl bg-primary py-3 px-4 text-xs font-bold text-white shadow-medium hover:bg-primary-hover transition flex items-center justify-center gap-2"
                      >
                        <Navigation className="h-4 w-4 animate-bounce" />
                        <span>View Trip & Live GPS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => completeTripMutation.mutate(nextTrip.id)}
                        disabled={completeTripMutation.isPending}
                        className="rounded-2xl border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 py-3 px-4 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {completeTripMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        <span>Complete Trip</span>
                      </button>
                    </div>
                  ) : confirmedPassengers.length > 0 ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => startTripMutation.mutate(nextTrip.id)}
                        disabled={startTripMutation.isPending}
                        className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 px-4 text-sm font-extrabold text-white shadow-medium transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                      >
                        {startTripMutation.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Play className="h-5 w-5 fill-current" />
                        )}
                        <span>START TRIP</span>
                      </button>
                      <div className="text-center">
                        <Link
                          to={`/driver/trips/${nextTrip.id}`}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Manage Trip Details →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`/driver/trips/${nextTrip.id}`)}
                      className="w-full rounded-2xl border border-border bg-surface-subtle py-3 px-4 text-xs font-bold text-foreground hover:border-primary transition flex items-center justify-center gap-1.5"
                    >
                      <span>Manage Trip Schedule</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── PENDING REQUESTS CARD ─── */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-foreground">
                  Pending Requests
                </span>
                {pendingRequests.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-white">
                    {pendingRequests.length}
                  </span>
                )}
              </div>

              <Link
                to="/driver/bookings"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {bookingsLoading ? (
              <div className="py-6 text-center text-xs text-foreground-secondary">
                <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary mb-1" />
                Loading requests...
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-1">
                <p className="text-xs text-foreground-secondary font-medium">
                  No pending booking requests.
                </p>
                <p className="text-[11px] text-foreground-muted">
                  New rider requests for your trips will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 3).map(({ booking: b, trip: t, rider: r }) => {
                  const riderName = r
                    ? `${r.firstName || ""} ${r.lastName || ""}`.trim() || "Student Passenger"
                    : "Student Passenger";
                  const dateStr = formatDate(t?.departureTime || b.bookingTime);
                  const timeStr = formatTime(t?.departureTime || b.bookingTime);
                  const totalFare = Number(t?.price || 40) * Number(b.requestedSeats || 1);

                  return (
                    <div
                      key={b.id}
                      className="rounded-2xl border border-border bg-surface-subtle p-4 space-y-3 shadow-soft"
                    >
                      {/* Top Rider Info & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-xs">
                            {riderName[0] || "R"}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-foreground">
                              {riderName}
                            </div>
                            <div className="text-[11px] text-foreground-secondary mt-0.5">
                              {b.requestedSeats} Seat{b.requestedSeats > 1 ? "s" : ""} •{" "}
                              <span className="font-bold text-primary">{formatCurrency(totalFare)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => rejectMutation.mutate(b.id)}
                            disabled={rejectMutation.isPending}
                            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground-secondary hover:text-danger hover:bg-danger-subtle transition disabled:opacity-50"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => acceptMutation.mutate(b.id)}
                            disabled={acceptMutation.isPending}
                            className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition disabled:opacity-50"
                          >
                            Accept
                          </button>
                        </div>
                      </div>

                      {/* Route & Schedule snippet */}
                      {t && (
                        <div className="border-t border-border-subtle pt-2 text-[11px] space-y-1 text-foreground-secondary">
                          <div className="flex items-center justify-between font-medium">
                            <span className="truncate max-w-[200px] text-foreground">
                              {t.source} → {t.destination}
                            </span>
                            <span className="font-bold text-primary shrink-0">
                              {dateStr} · {timeStr}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Active Vehicle & Quick Links */}
        <div className="space-y-6">
          {/* ─── ACTIVE VEHICLE CARD ─── */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="font-extrabold text-sm text-foreground">
                Active Vehicle
              </span>
              <Link
                to="/driver/vehicle"
                className="text-xs font-bold text-primary hover:underline"
              >
                Edit
              </Link>
            </div>

            {vehicle ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
                    {vehicle.vehicleType === "BIKE" ? (
                      <Bike className="h-5 w-5" />
                    ) : (
                      <Car className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-foreground truncate">
                      {vehicle.brand} {vehicle.model}
                    </div>
                    <div className="text-xs text-foreground-secondary font-mono">
                      {vehicle.registrationNumber}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-surface-subtle p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Capacity:</span>
                    <span className="font-bold text-foreground">
                      {vehicle.maxPassengerCapacity} Passengers
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {vehicle.status || "Active"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-4 text-center space-y-2 text-xs">
                <p className="text-foreground-secondary">
                  No vehicle registered yet.
                </p>
                <Link
                  to="/driver/vehicle"
                  className="font-bold text-primary block hover:underline"
                >
                  + Register Vehicle
                </Link>
              </div>
            )}
          </div>

          {/* Quick Driver Resources */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-3">
            <span className="font-extrabold text-sm text-foreground block">
              Driver Resources
            </span>
            <div className="space-y-1.5 text-xs">
              <Link
                to="/driver/trips"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-subtle transition text-foreground"
              >
                <span>My Trip History</span>
                <ChevronRight className="h-4 w-4 text-foreground-secondary" />
              </Link>
              <Link
                to="/driver/profile"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-subtle transition text-foreground"
              >
                <span>Driver Profile & Verification</span>
                <ChevronRight className="h-4 w-4 text-foreground-secondary" />
              </Link>
              <Link
                to="/notifications"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-subtle transition text-foreground"
              >
                <span>Safety & Alert Center</span>
                <ChevronRight className="h-4 w-4 text-foreground-secondary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
