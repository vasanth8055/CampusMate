import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Navigation,
  Play,
  CheckCircle2,
  Users,
  Phone,
  MessageSquare,
  AlertCircle,
  Loader2,
  Edit2,
  Car,
  RefreshCw,
  MapPin,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

import { getTrip, startTrip, completeTrip, cancelTrip } from "@/features/trip/api/trip.api";
import { getTripBookingsWithDetails } from "@/features/booking/api/booking.api";
import { updateLocation } from "@/features/tracking/api/tracking.api";
import { MobilityMap } from "@/components/maps/MobilityMap";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { fetchRoadRoute } from "@/features/location/services/routing.service";
import { useTrackingStore } from "@/store/tracking.store";

export default function TripDetailsDriverPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [driverCoords, setDriverCoords] = useState<[number, number] | null>(null);
  const [routePolyline, setRoutePolyline] = useState<[number, number][] | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [gpsPermissionError, setGpsPermissionError] = useState<string | null>(null);

  // Real-time tracking store for WebSocket stream & Redis polling fallback
  const { startTracking, stopTracking, latestLocation, isConnected, isPolling } =
    useTrackingStore();

  useEffect(() => {
    if (tripId) {
      startTracking(tripId);
    }
    return () => {
      stopTracking();
    };
  }, [tripId, startTracking, stopTracking]);

  // Query: Trip Info
  const {
    data: tripRes,
    isLoading: tripLoading,
    isError: tripError,
    refetch: refetchTrip,
  } = useQuery({
    queryKey: ["trips", tripId],
    queryFn: () => (tripId ? getTrip(tripId) : Promise.resolve(null)),
    enabled: Boolean(tripId),
    refetchInterval: 5000,
  });
  const trip = tripRes?.data;

  // Query: Bookings with Passenger details
  const { data: bookingsRes } = useQuery({
    queryKey: ["trips", tripId, "bookings"],
    queryFn: () => (tripId ? getTripBookingsWithDetails(tripId) : Promise.resolve([])),
    enabled: Boolean(tripId),
    refetchInterval: 5000,
  });
  const bookings = bookingsRes ?? [];

  // Mutations
  const startMut = useMutation({
    mutationFn: () => (tripId ? startTrip(tripId) : Promise.resolve(null)),
    onSuccess: () => {
      toast.success("Trip started! Live GPS tracking active.");
      qc.invalidateQueries({ queryKey: ["trips", tripId] });
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not start trip.");
    },
  });

  const completeMut = useMutation({
    mutationFn: () => (tripId ? completeTrip(tripId) : Promise.resolve(null)),
    onSuccess: () => {
      toast.success("Trip completed! Great job.");
      setShowCompleteModal(false);
      qc.invalidateQueries({ queryKey: ["trips", tripId] });
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      navigate("/driver/trips");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not complete trip.");
    },
  });

  const cancelMut = useMutation({
    mutationFn: () => (tripId ? cancelTrip(tripId) : Promise.resolve(null)),
    onSuccess: () => {
      toast.success("Trip cancelled.");
      qc.invalidateQueries({ queryKey: ["trips", tripId] });
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      navigate("/driver/trips");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not cancel trip.");
    },
  });

  // Watch Driver GPS position and stream to backend when trip is IN_PROGRESS
  const startGpsWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsPermissionError("Geolocation is not supported by your browser.");
      return () => {};
    }

    setGpsPermissionError(null);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDriverCoords([lat, lng]);
        setGpsPermissionError(null);

        if (tripId && trip?.status === "IN_PROGRESS") {
          try {
            await updateLocation(tripId, {
              latitude: lat,
              longitude: lng,
              speed: pos.coords.speed || 0,
              heading: pos.coords.heading || 0,
              accuracy: pos.coords.accuracy || 5,
            });
          } catch (e) {
            console.warn("GPS update stream error:", e);
          }
        }
      },
      (err) => {
        console.warn("GPS watch warning:", err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsPermissionError(
            "Location permission was denied. Please allow location access to stream live GPS to your passengers."
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsPermissionError("Waiting for GPS position signal...");
        }
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [tripId, trip?.status]);

  useEffect(() => {
    const unwatch = startGpsWatch();
    return () => {
      if (unwatch) unwatch();
    };
  }, [startGpsWatch]);

  // Derived Coordinates
  const pickupCoords: [number, number] = useMemo(
    () => [trip?.sourceLatitude || 16.5062, trip?.sourceLongitude || 80.648],
    [trip?.sourceLatitude, trip?.sourceLongitude]
  );

  const destCoords: [number, number] = useMemo(
    () => [trip?.destinationLatitude || 16.4839, trip?.destinationLongitude || 80.6937],
    [trip?.destinationLatitude, trip?.destinationLongitude]
  );

  // Dynamic Driver position (from local device GPS or latest Redis/STOMP stream or pickup point)
  const currentDriverLocation: [number, number] = useMemo(() => {
    if (driverCoords && !isNaN(driverCoords[0]) && !isNaN(driverCoords[1])) {
      return driverCoords;
    }
    if (latestLocation?.latitude && latestLocation?.longitude) {
      return [latestLocation.latitude, latestLocation.longitude];
    }
    return pickupCoords;
  }, [driverCoords, latestLocation?.latitude, latestLocation?.longitude, pickupCoords]);

  // Fetch road-following polyline
  useEffect(() => {
    let isCancelled = false;

    fetchRoadRoute(pickupCoords, destCoords).then((coords) => {
      if (!isCancelled) {
        setRoutePolyline(coords);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [trip?.id, pickupCoords[0], pickupCoords[1], destCoords[0], destCoords[1]]);

  // Safe back navigation
  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/driver/dashboard");
    }
  };

  // Safe confirmed passengers list
  const confirmedPassengers = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    return bookings.filter(
      (item) =>
        item &&
        item.booking &&
        (item.booking.status === "CONFIRMED" ||
          item.booking.status === "ACCEPTED" ||
          item.booking.status === "ONGOING")
    );
  }, [bookings]);

  // Vehicle info
  const vehicleModel = trip?.vehicle
    ? `${trip.vehicle.brand} ${trip.vehicle.model}`.trim()
    : "Registered Vehicle";
  const vehiclePlate = trip?.vehicle?.registrationNumber || "AP16 AB 1234";
  const vehicleColor = trip?.vehicle?.color || "Standard";

  if (tripLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-9 w-9 animate-spin text-primary mx-auto" />
          <div className="text-xs font-semibold text-foreground-secondary">
            Loading live trip & GPS...
          </div>
        </div>
      </div>
    );
  }

  if (tripError || !trip) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 text-center space-y-4 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-subtle text-danger mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">Trip Not Found</h2>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Unable to load the requested commute. It may have expired or you may not have permission to view it.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => refetchTrip()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
            >
              Back to Trips
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLive = trip.status === "IN_PROGRESS";
  const isScheduled = trip.status === "SCHEDULED";

  return (
    <div className="relative mx-auto max-w-md pb-24 lg:max-w-4xl space-y-4 animate-in fade-in duration-300">
      {/* ─── Map-First Interactive View ─── */}
      <div className="relative h-[55vh] sm:h-[60vh] w-full rounded-3xl overflow-hidden border border-border shadow-large bg-surface-subtle">
        <MobilityMap
          center={currentDriverLocation}
          zoom={14}
          pickupLocation={pickupCoords}
          destinationLocation={destCoords}
          driverLocation={currentDriverLocation}
          driverHeading={latestLocation?.heading || 0}
          driverLabel={vehicleModel}
          routePolyline={routePolyline || undefined}
          interactive={true}
          className="h-full w-full"
        />

        {/* Floating Top Bar */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={handleBack}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface/95 border border-border text-foreground backdrop-blur-md shadow-premium hover:bg-surface transition"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Status & Live Pill */}
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-surface/95 border border-border px-4 py-1.5 backdrop-blur-md shadow-premium text-xs font-extrabold">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isLive
                  ? isConnected
                    ? "bg-emerald-500 animate-pulse"
                    : isPolling
                    ? "bg-amber-500"
                    : "bg-emerald-600 animate-pulse"
                  : isScheduled
                  ? "bg-primary"
                  : "bg-foreground-muted"
              }`}
            />
            <span className="text-foreground">
              {isLive
                ? isConnected
                  ? "• Live GPS Connected"
                  : isPolling
                  ? "• Reconnecting... (Live Stream)"
                  : "• Trip in Progress"
                : isScheduled
                ? "• Scheduled Ride"
                : `• ${trip.status}`}
            </span>
          </div>

          <div className="w-10" />
        </div>
      </div>

      {/* ─── GPS Warning / Location Banner if Permission Issue ─── */}
      {gpsPermissionError && isLive && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-4 shadow-soft space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xs font-bold">
            <Radio className="h-4 w-4 animate-pulse text-amber-600" />
            <span>GPS Location Required</span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            {gpsPermissionError}
          </p>
          <button
            type="button"
            onClick={() => startGpsWatch()}
            className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition shadow-soft"
          >
            Retry GPS Connection
          </button>
        </div>
      )}

      {/* ─── Bottom Sheet / Commute Info Panel ─── */}
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-premium space-y-5">
        {/* Status Header & Departure */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-subtle text-primary font-bold">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <span>{isLive ? "Active Commute" : "Scheduled Ride"}</span>
                {isLive && (
                  <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-extrabold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live GPS
                  </span>
                )}
              </div>
              <div className="text-xs text-foreground-secondary mt-0.5">
                {formatDateTime(trip.departureTime)} • {trip.availableSeats} Seats Available
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-base font-black text-foreground">
              {formatCurrency(trip.price)}
            </span>
            <span className="text-[11px] text-foreground-secondary block">/ seat</span>
          </div>
        </div>

        {/* Dynamic Route Stops (Home ↔ College) */}
        <div className="space-y-3 bg-surface-subtle p-4 rounded-2xl text-xs">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
              <MapPin className="h-3 w-3" />
            </div>
            <div>
              <span className="font-extrabold text-foreground block text-[11px] tracking-wide text-foreground-secondary uppercase">
                Pickup Location
              </span>
              <span className="font-bold text-foreground text-xs">{trip.source}</span>
            </div>
          </div>

          <div className="ml-2.5 border-l-2 border-dashed border-border pl-4 py-0.5" />

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
              <MapPin className="h-3 w-3" />
            </div>
            <div>
              <span className="font-extrabold text-foreground block text-[11px] tracking-wide text-foreground-secondary uppercase">
                Destination Dropoff
              </span>
              <span className="font-bold text-foreground text-xs">{trip.destination}</span>
            </div>
          </div>
        </div>

        {/* ─── Vehicle Information Card ─── */}
        <div className="rounded-2xl border border-border bg-surface-subtle p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-foreground">{vehicleModel}</div>
                <div className="text-[11px] text-foreground-secondary">
                  {vehicleColor !== "Standard" ? `${vehicleColor} • ` : ""}Registered Vehicle
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-surface px-2.5 py-1 text-xs font-mono font-extrabold text-primary border border-border">
              {vehiclePlate}
            </div>
          </div>
        </div>

        {/* ─── Confirmed Booked Passengers ─── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span>Confirmed Passengers ({confirmedPassengers.length})</span>
            </span>
          </div>

          {confirmedPassengers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-5 text-center text-xs text-foreground-secondary">
              No passengers have booked this commute yet.
            </div>
          ) : (
            confirmedPassengers.map(({ booking: b, rider: r }) => {
              if (!b) return null;
              const riderName = r
                ? `${r.firstName || ""} ${r.lastName || ""}`.trim() || "Student Rider"
                : "Student Rider";
              const totalFare = Number(trip?.price || 40) * Number(b.requestedSeats || 1);

              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-border bg-surface p-4 shadow-soft space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle text-primary font-extrabold text-xs shadow-soft">
                        {riderName[0] || "P"}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <span>{riderName}</span>
                          <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            {b.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-foreground-secondary mt-0.5">
                          {b.requestedSeats} Seat{b.requestedSeats > 1 ? "s" : ""} Booked • {formatCurrency(totalFare)}
                        </div>
                      </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toast.info(`Calling passenger ${riderName}...`)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-subtle border border-border text-foreground hover:bg-primary-subtle hover:text-primary transition"
                        title="Call"
                        aria-label="Call Passenger"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info(`Chat with ${riderName} opened.`)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-subtle border border-border text-foreground hover:bg-primary-subtle hover:text-primary transition"
                        title="Message"
                        aria-label="Message Passenger"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ─── Driver Control Actions (Start Ride / Complete Ride / Cancel) ─── */}
        <div className="space-y-2 pt-2">
          {isScheduled && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startMut.mutate()}
                disabled={startMut.isPending}
                className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 px-4 text-xs font-extrabold text-white shadow-soft transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {startMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
                <span>Start Ride Now</span>
              </button>

              <Link
                to={`/driver/trips/${trip.id}/edit`}
                className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-xs font-bold text-foreground hover:bg-surface-subtle transition flex items-center gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Link>
            </div>
          )}

          {isLive && (
            <button
              type="button"
              onClick={() => setShowCompleteModal(true)}
              className="w-full rounded-2xl bg-primary hover:bg-primary-hover py-4 px-6 text-sm font-black text-white shadow-medium transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Complete Ride</span>
            </button>
          )}

          {isScheduled && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to cancel this scheduled trip?")) {
                  cancelMut.mutate();
                }
              }}
              disabled={cancelMut.isPending}
              className="w-full text-center text-xs font-bold text-danger hover:underline pt-1"
            >
              Cancel Trip
            </button>
          )}
        </div>
      </div>

      {/* ─── Complete Trip Modal ─── */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-premium space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">
                Arrived at Destination?
              </h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Confirm ride completion to finalize all passenger bookings and record earnings.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-surface-subtle"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => completeMut.mutate()}
                disabled={completeMut.isPending}
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-hover flex items-center justify-center gap-1.5 shadow-soft"
              >
                {completeMut.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>Yes, Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
