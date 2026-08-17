import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { MobilityMap } from "@/components/maps/MobilityMap";
import { RideCompletedModal } from "@/features/trip/components/RideCompletedModal";
import { getTrip } from "@/features/trip/api/trip.api";
import { useTrackingStore } from "@/store/tracking.store";
import { fetchRoadRoute } from "@/features/location/services/routing.service";

export default function TrackingPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  // Tracking store
  const { startTracking, stopTracking, latestLocation, isConnected, isPolling } =
    useTrackingStore();

  // Fetch Trip Info
  const {
    data: tripRes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["trips", tripId],
    queryFn: () => (tripId ? getTrip(tripId) : Promise.resolve(null)),
    enabled: Boolean(tripId),
    refetchInterval: 5000,
  });

  const trip = tripRes?.data;

  // Start real-time tracking when component mounts
  useEffect(() => {
    if (tripId) {
      startTracking(tripId);
    }
    return () => {
      stopTracking();
    };
  }, [tripId, startTracking, stopTracking]);

  // Check if trip was completed
  useEffect(() => {
    if (trip?.status === "COMPLETED") {
      setIsCompletedModalOpen(true);
    }
  }, [trip?.status]);

  // Derived coordinates from actual trip data
  const pickupCoords: [number, number] = useMemo(
    () => [trip?.sourceLatitude || 16.5062, trip?.sourceLongitude || 80.648],
    [trip?.sourceLatitude, trip?.sourceLongitude]
  );

  const destCoords: [number, number] = useMemo(
    () => [trip?.destinationLatitude || 16.4839, trip?.destinationLongitude || 80.6937],
    [trip?.destinationLatitude, trip?.destinationLongitude]
  );

  // Dynamic Driver position (from real-time WebSocket/Redis stream or pickup)
  const driverLocation: [number, number] = useMemo(() => {
    if (latestLocation?.latitude && latestLocation?.longitude) {
      return [latestLocation.latitude, latestLocation.longitude];
    }
    return pickupCoords;
  }, [latestLocation?.latitude, latestLocation?.longitude, pickupCoords]);

  // Real road route polyline (cached, calculated between pickup and destination)
  const [routePolyline, setRoutePolyline] = useState<[number, number][] | null>(null);

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
      navigate("/bookings");
    }
  };

  const driverName = trip?.driver
    ? `${trip.driver.firstName} ${trip.driver.lastName}`.trim()
    : "Campus Driver";
  const vehicleModel = trip?.vehicle
    ? `${trip.vehicle.brand} ${trip.vehicle.model}`.trim()
    : "Registered Vehicle";
  const vehicleColor = trip?.vehicle?.color || "Standard";
  const plateText = trip?.vehicle?.registrationNumber || "Campus Transit";

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="text-xs text-foreground-secondary font-medium">
            Connecting to live vehicle tracking...
          </div>
        </div>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 text-center space-y-4 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-subtle text-danger mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">Ride Tracking Unavailable</h2>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              We couldn't retrieve the live details for this trip. The commute may have expired or is not active yet.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
            >
              My Rides
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-[calc(100vh-80px)] w-full max-w-md flex-col overflow-hidden pb-16 lg:max-w-4xl rounded-2xl border border-border shadow-large bg-surface">
      {/* ─── Top Header (Stitch UI #10) ─── */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={handleBack}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-medium backdrop-blur-md border border-border hover:bg-surface transition"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Live Indicator Pill */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-surface/95 px-4 py-1.5 text-xs font-extrabold text-foreground shadow-medium backdrop-blur-md border border-border">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected
                ? "bg-emerald-500 animate-pulse"
                : isPolling
                ? "bg-amber-500"
                : "bg-primary animate-pulse"
            }`}
          ></span>
          <span>{isConnected ? "• Live GPS" : isPolling ? "• Real-Time Stream" : "• Tracking"}</span>
        </div>

        {/* Emergency SOS Button */}
        <button
          type="button"
          onClick={() => toast.info("Emergency assistance contacted. Campus security alerted.")}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-danger shadow-medium backdrop-blur-md border border-border hover:bg-danger-subtle transition"
          aria-label="Safety Assistance"
        >
          <ShieldAlert className="h-5 w-5" />
        </button>
      </div>

      {/* ─── Mobility Map ─── */}
      <div className="flex-1 w-full relative min-h-[350px]">
        <MobilityMap
          center={driverLocation}
          zoom={14}
          pickupLocation={pickupCoords}
          destinationLocation={destCoords}
          driverLocation={driverLocation}
          driverHeading={latestLocation?.heading || 0}
          driverLabel={driverName}
          routePolyline={routePolyline || undefined}
          className="h-full w-full"
        />
      </div>

      {/* ─── Bottom Slide-Up Card (Driver & Vehicle Info) ─── */}
      <div className="rounded-t-3xl border-t border-border bg-surface p-5 shadow-large space-y-4 animate-in slide-in-from-bottom-5 duration-300">
        {/* Driver Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary font-extrabold text-base shadow-soft">
                {driverName[0] || "D"}
              </div>
              <span className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-emerald-600 px-1.5 py-0.2 text-[10px] font-bold text-white shadow-soft">
                ✓
              </span>
            </div>
            <div>
              <div className="font-extrabold text-sm text-foreground">{driverName}</div>
              <div className="text-xs text-foreground-secondary mt-0.5">
                {vehicleModel} {vehicleColor && vehicleColor !== "Standard" ? `• ${vehicleColor}` : ""}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-primary-subtle/80 px-3 py-1.5 text-xs font-mono font-extrabold text-primary border border-primary/20">
            {plateText}
          </div>
        </div>

        {/* Action Buttons Row: Call, Message, Safety */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => toast.success(`Calling ${driverName}...`)}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle py-2.5 px-3 text-xs font-bold text-foreground hover:bg-surface transition shadow-soft active:scale-95"
          >
            <Phone className="h-4 w-4 text-primary" />
            <span>Call</span>
          </button>

          <button
            type="button"
            onClick={() => toast.info(`Message thread with ${driverName} opened.`)}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle py-2.5 px-3 text-xs font-bold text-foreground hover:bg-surface transition shadow-soft active:scale-95"
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            <span>Message</span>
          </button>

          <button
            type="button"
            onClick={() => toast.warning("Campus Emergency & Safety protocol active.")}
            className="flex items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger-subtle/40 py-2.5 px-3 text-xs font-bold text-danger hover:bg-danger-subtle transition shadow-soft active:scale-95"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Safety</span>
          </button>
        </div>

        {/* Route Stops Summary */}
        <div className="rounded-2xl border border-border bg-surface-subtle p-3.5 space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary ring-2 ring-primary-subtle"></div>
            <div>
              <span className="font-bold text-foreground block">PICKUP</span>
              <span className="text-foreground-secondary">{trip?.source || "Pickup Location"}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="mt-1 h-2 w-2 rounded-full bg-secondary ring-2 ring-secondary-subtle"></div>
            <div>
              <span className="font-bold text-foreground block">DROPOFF</span>
              <span className="text-foreground-secondary">{trip?.destination || "Dropoff Destination"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Ride Completed Modal ─── */}
      <RideCompletedModal
        isOpen={isCompletedModalOpen}
        onClose={() => {
          setIsCompletedModalOpen(false);
          navigate("/bookings");
        }}
        tripSummary={{
          driverName,
          driverRating: (trip?.driver as any)?.rating,
          vehicleModel,
          source: trip?.source,
          destination: trip?.destination,
          fare: trip?.price,
        }}
        onSubmitFeedback={() => {
          toast.success("Thank you for your rating!");
        }}
      />
    </div>
  );
}
