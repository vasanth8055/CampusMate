import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

import { MobilityMap } from "@/components/maps/MobilityMap";
import { BookingReviewModal } from "@/features/booking/components/BookingReviewModal";
import { getTrip } from "@/features/trip/api/trip.api";
import { createBooking } from "@/features/booking/api/booking.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { formatCurrency, formatTime, formatDate } from "@/utils/format";
import { fetchRoadRoute } from "@/features/location/services/routing.service";

export default function TripDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [routePolyline, setRoutePolyline] = useState<[number, number][] | null>(null);

  // Fetch Trip Details
  const { data: tripRes, isLoading, isError } = useQuery({
    queryKey: ["trips", tripId],
    queryFn: () => (tripId ? getTrip(tripId) : Promise.resolve(null)),
    enabled: Boolean(tripId),
    staleTime: 1000 * 60,
  });

  const trip = tripRes?.data;

  // Derive coordinates from actual trip data
  const pickupCoords: [number, number] = [
    trip?.sourceLatitude || 16.5062,
    trip?.sourceLongitude || 80.6480,
  ];
  const destCoords: [number, number] = [
    trip?.destinationLatitude || 16.4839,
    trip?.destinationLongitude || 80.6937,
  ];

  // Fetch road route geometry (cached)
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
      navigate("/find-rides");
    }
  };

  // Booking Mutation
  const bookingMutation = useMutation({
    mutationFn: async ({ seats }: { seats: number }) => {
      if (!tripId) throw new Error("No trip id");
      return createBooking({ tripId, requestedSeats: seats });
    },
    onSuccess: () => {
      toast.success("Booking request sent! Waiting for driver approval.");
      setIsReviewModalOpen(false);
      navigate("/bookings");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Could not request booking. Please try again.";
      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="text-xs text-foreground-secondary font-medium">
            Loading commute details...
          </div>
        </div>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="mx-auto max-w-md p-6 text-center space-y-4">
        <h2 className="text-lg font-bold">Trip Not Found</h2>
        <p className="text-xs text-foreground-secondary">
          The requested commute could not be located or has expired.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft"
        >
          Go Back
        </button>
      </div>
    );
  }

  const driverName = trip.driver
    ? `${trip.driver.firstName} ${trip.driver.lastName}`.trim()
    : "Verified Driver";
  const plateText = trip.vehicle?.registrationNumber || "AP16 AB 1234";
  const priceFormatted = formatCurrency(trip.price);

  const departureDate = formatDate(trip.departureTime);
  const departureTime = formatTime(trip.departureTime);

  // Check if current user is the driver/creator of this trip
  const isTripOwner = Boolean(
    authUser &&
      (authUser.userId === trip.driverId ||
        authUser.userId === trip.driver?.userId ||
        (authUser.email && trip.driver?.email && authUser.email === trip.driver.email))
  );

  return (
    <div className="relative mx-auto flex h-[calc(100vh-80px)] w-full max-w-md flex-col overflow-hidden pb-16 lg:max-w-4xl rounded-2xl border border-border shadow-large bg-surface">
      {/* ─── Top Header ─── */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-medium backdrop-blur-md border border-border hover:bg-surface transition"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="rounded-full bg-surface/90 px-4 py-1.5 text-xs font-extrabold text-foreground shadow-medium backdrop-blur-md border border-border">
          Trip Details
        </div>
        <div className="w-10"></div>
      </div>

      {/* ─── Center Mobility Map ─── */}
      <div className="relative flex-1 w-full h-full min-h-[260px]">
        <MobilityMap
          pickupLocation={pickupCoords}
          destinationLocation={destCoords}
          routePolyline={routePolyline}
          interactive={true}
          padding={[60, 60]}
        />

        {/* Floating Route Summary Card */}
        <div className="absolute top-20 inset-x-6 z-10 mx-auto max-w-sm rounded-2xl bg-surface/95 p-3 shadow-premium backdrop-blur-md border border-border text-center space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Route Summary
          </div>
          <div className="text-xs font-bold text-foreground">
            Duration: 18 mins • Campus Direct
          </div>
        </div>
      </div>

      {/* ─── Bottom Sheet Details ─── */}
      <div className="relative z-20 flex flex-col rounded-t-sheet bg-surface/95 p-5 shadow-premium backdrop-blur-md border-t border-border space-y-4 max-h-[55vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center -mt-2 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-border-secondary/70"></div>
        </div>

        {/* Route Title & Price */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <h1 className="text-lg font-extrabold tracking-tight text-foreground truncate">
              {trip.source} → {trip.destination}
            </h1>
            <div className="flex items-center gap-2 text-xs font-medium text-foreground-secondary mt-0.5">
              <span>{departureDate}</span>
              <span>•</span>
              <span className="font-bold text-primary">{departureTime}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-primary">
              {priceFormatted}
            </div>
            <div className="text-[10px] text-foreground-secondary">per seat</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-xl bg-primary-subtle/70 px-3 py-1 text-xs font-bold text-primary">
            <Users className="h-3.5 w-3.5" />
            <span>{trip.availableSeats || 2} Seats Left</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-xl bg-secondary-subtle/70 px-3 py-1 text-xs font-bold text-secondary">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Small Bags</span>
          </span>
        </div>

        {/* Driver Card Container */}
        <div className="rounded-2xl border border-border bg-surface-subtle p-4 space-y-3">
          <div className="text-[11px] font-bold text-foreground-secondary uppercase tracking-wider">
            Your Driver
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary font-extrabold text-base shadow-soft">
                {driverName[0]}
              </div>
              <div>
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <span>{driverName}</span>
                  <CheckCircle2 className="h-4 w-4 text-primary fill-primary-subtle" />
                </div>
                <div className="text-xs text-foreground-secondary mt-0.5">
                  Verified Campus Driver
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="rounded-lg bg-surface px-2.5 py-1 text-[11px] font-mono font-bold text-foreground border border-border">
                {plateText}
              </span>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-2.5 flex items-center gap-2 text-xs font-medium text-foreground-secondary">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>Verified Student • Campus Carpool</span>
          </div>
        </div>

        {/* Pickup / Dropoff Instructions */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary ring-2 ring-primary-subtle"></div>
            <div>
              <span className="font-bold text-foreground">Pickup: </span>
              <span className="text-foreground-secondary">{trip.source}</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="mt-1 h-2 w-2 rounded-full bg-secondary ring-2 ring-secondary-subtle"></div>
            <div>
              <span className="font-bold text-foreground">Dropoff: </span>
              <span className="text-foreground-secondary">{trip.destination}</span>
            </div>
          </div>
        </div>

        {/* Driver Ownership Notice / Action */}
        {isTripOwner ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>This is your offered ride</span>
            </div>
            <p className="text-[11px] text-foreground-secondary">
              You cannot request seats on a ride created by your own driver account.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/driver/trips/${trip.id}`)}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft"
            >
              Manage in Driver Dashboard →
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-button bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99]"
          >
            <span>Request Ride</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Review Modal */}
      {!isTripOwner && (
        <BookingReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          trip={trip}
          isPending={bookingMutation.isPending}
          onConfirmBooking={(seats) => {
            bookingMutation.mutate({ seats });
          }}
        />
      )}
    </div>
  );
}
