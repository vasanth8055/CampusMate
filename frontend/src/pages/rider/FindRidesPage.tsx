import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Home,
  GraduationCap,
  Calendar,
  ArrowRight,
  Sparkles,
  Users,
  ChevronDown,
} from "lucide-react";

import { MobilityMap } from "@/components/maps/MobilityMap";
import { CollegeSelectorModal, type EnrichedCollege } from "@/features/college/components/CollegeSelectorModal";
import { DateTimePickerModal } from "@/features/trip/components/DateTimePickerModal";
import { PickupLocationSheet } from "@/features/trip/components/PickupLocationSheet";
import { BookingReviewModal } from "@/features/booking/components/BookingReviewModal";
import { useLocationStore } from "@/store/location.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createBooking } from "@/features/booking/api/booking.api";
import { searchTrips, getTrip } from "@/features/trip/api/trip.api";
import { findMatches } from "@/features/matching/api/matching.api";
import {
  formatCurrency,
  formatTime,
  formatDate,
  addMinutesToLocalDateTime,
} from "@/utils/format";
import type { TripResponse } from "@/features/trip/types/trip.types";
import type { MatchRequest } from "@/features/matching/types/matching.types";

export default function FindRidesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const {
    currentCoords,
    currentAddress,
    homeLocation,
    selectedCollege,
    fetchCurrentLocation,
    setSelectedCollege,
  } = useLocationStore();


  // Location State initialized from real store data
  const [pickupAddress, setPickupAddress] = useState<string>(() => {
    return currentAddress || "Current Location";
  });
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(() => {
    return currentCoords;
  });

  const [destinationName, setDestinationName] = useState<string>(() => {
    return selectedCollege.name;
  });
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(() => {
    return [selectedCollege.latitude, selectedCollege.longitude];
  });
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(() => {
    return selectedCollege.id;
  });

  // Date, Time, Seats State - defaults to next morning 8:30 AM if current time is evening
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date();
    const isEvening = now.getHours() >= 18;
    const defaultDate = new Date(now);
    if (isEvening) {
      defaultDate.setDate(defaultDate.getDate() + 1);
      defaultDate.setHours(8, 30, 0, 0);
    } else {
      defaultDate.setMinutes(defaultDate.getMinutes() + 15, 0, 0);
    }
    return defaultDate;
  });
  const [flexibilityMinutes, setFlexibilityMinutes] = useState<number>(15);
  const [seats, setSeats] = useState<number>(1);


  // Modals visibility
  const [isPickupSheetOpen, setIsPickupSheetOpen] = useState(false);
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTripForReview, setSelectedTripForReview] = useState<TripResponse | null>(null);

  // Map Pick Mode
  const [isPickingOnMap, setIsPickingOnMap] = useState(false);

  // Routing Polyline (OSRM)
  const [routePolyline, setRoutePolyline] = useState<[number, number][] | null>(null);

  // Search filter state
  const [activeFilter, setActiveFilter] = useState<"ALL" | "TIME" | "PRICE" | "SEATS">("ALL");
  const [priceSortAsc, setPriceSortAsc] = useState<boolean>(true);
  const [quickRoute, setQuickRoute] = useState<"HOME_CAMPUS" | "CAMPUS_HOME">("HOME_CAMPUS");

  // Search Results
  const [searchResults, setSearchResults] = useState<TripResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Trigger GPS detection on mount if not available
  useEffect(() => {
    fetchCurrentLocation(false).then((geo) => {
      if (geo && !pickupCoords) {
        setPickupCoords([geo.latitude, geo.longitude]);
        setPickupAddress(geo.formattedAddress);
      }
    });
  }, [fetchCurrentLocation]);

  // Keep pickup updated if current location is detected initially
  useEffect(() => {
    if (currentCoords && (!pickupCoords || pickupAddress === "Current Location")) {
      setPickupCoords(currentCoords);
      if (currentAddress) {
        setPickupAddress(currentAddress);
      }
    }
  }, [currentCoords, currentAddress]);

  // Keep destination synchronized with selected college
  useEffect(() => {
    if (selectedCollege) {
      setSelectedCollegeId(selectedCollege.id);
      if (quickRoute === "HOME_CAMPUS") {
        setDestinationName(selectedCollege.name);
        setDestinationCoords([selectedCollege.latitude, selectedCollege.longitude]);
      } else if (quickRoute === "CAMPUS_HOME") {
        setPickupAddress(selectedCollege.name);
        setPickupCoords([selectedCollege.latitude, selectedCollege.longitude]);
      }
    }
  }, [selectedCollege, quickRoute]);

  // Geolocation trigger
  const handleGetGeolocation = useCallback(async () => {
    const geo = await fetchCurrentLocation(true);
    if (geo) {
      setPickupCoords([geo.latitude, geo.longitude]);
      setPickupAddress(geo.formattedAddress);
      toast.success("Location updated via GPS.");
    } else {
      toast.error("Location permission denied. Please select location manually.");
    }
  }, [fetchCurrentLocation]);

  // Handle shortcuts from search query params
  useEffect(() => {
    const shortcut = searchParams.get("shortcut");
    const collegeCoords: [number, number] = [
      selectedCollege.latitude,
      selectedCollege.longitude,
    ];

    if (shortcut === "home-to-college") {
      setQuickRoute("HOME_CAMPUS");
      if (homeLocation) {
        setPickupAddress(homeLocation.address);
        setPickupCoords([homeLocation.latitude, homeLocation.longitude]);
      } else if (currentCoords && currentAddress) {
        setPickupAddress(currentAddress);
        setPickupCoords(currentCoords);
      }
      setDestinationName(selectedCollege.name);
      setDestinationCoords(collegeCoords);
    } else if (shortcut === "college-to-home") {
      setQuickRoute("CAMPUS_HOME");
      setPickupAddress(selectedCollege.name);
      setPickupCoords(collegeCoords);
      if (homeLocation) {
        setDestinationName(homeLocation.address);
        setDestinationCoords([homeLocation.latitude, homeLocation.longitude]);
      } else if (currentCoords && currentAddress) {
        setDestinationName(currentAddress);
        setDestinationCoords(currentCoords);
      }
    }
  }, [searchParams, homeLocation, currentCoords, currentAddress, selectedCollege]);

  // Fetch OSRM Route polyline dynamically when coordinates change
  useEffect(() => {
    if (!pickupCoords || !destinationCoords) {
      setRoutePolyline(null);
      return;
    }

    const [sLat, sLng] = pickupCoords;
    const [dLat, dLng] = destinationCoords;

    const url = `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${dLng},${dLat}?overview=full&geometries=geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "Ok" && data.routes?.[0]) {
          const route = data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]]
          );
          setRoutePolyline(coords);
        } else {
          setRoutePolyline([pickupCoords, destinationCoords]);
        }
      })
      .catch(() => {
        setRoutePolyline([pickupCoords, destinationCoords]);
      });
  }, [pickupCoords, destinationCoords]);

  // Search Mutation
  const searchMutation = useMutation({
    mutationFn: async (overrideParams?: {
      date?: Date;
      flexibility?: number;
      seatsCount?: number;
      pickup?: string;
      destination?: string;
    }) => {
      const targetDate = overrideParams?.date || selectedDate;
      const flex =
        overrideParams?.flexibility !== undefined
          ? overrideParams.flexibility
          : flexibilityMinutes;
      const targetSeats =
        overrideParams?.seatsCount !== undefined
          ? overrideParams.seatsCount
          : seats;
      const targetPickup = overrideParams?.pickup || pickupAddress;
      const targetDest = overrideParams?.destination || destinationName;

      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, "0");
      const d = String(targetDate.getDate()).padStart(2, "0");
      const h = String(targetDate.getHours()).padStart(2, "0");
      const min = String(targetDate.getMinutes()).padStart(2, "0");
      const baseIso = `${y}-${m}-${d}T${h}:${min}:00`;

      const fromTime = addMinutesToLocalDateTime(baseIso, -flex);
      const toTime = addMinutesToLocalDateTime(baseIso, flex);

      console.debug("[CampusMate Search] Querying available rides:", {
        targetDate: baseIso,
        fromTime,
        toTime,
        flexibilityMinutes: flex,
        seats: targetSeats,
        pickup: targetPickup,
        destination: targetDest,
        riderId: authUser?.userId,
      });

      try {
        const tripsRes = await searchTrips({
          source: targetPickup,
          destination: targetDest,
          from: fromTime,
          to: toTime,
          seats: targetSeats,
        });

        if (tripsRes.data && tripsRes.data.length > 0) {
          console.debug(
            "[CampusMate Search] Found trips from trip-service:",
            tripsRes.data.length
          );
          return tripsRes.data;
        }
      } catch (err) {
        console.warn("[CampusMate Search] Direct search exception:", err);
      }

      // Try matching service with real coordinates
      const matchPayload: MatchRequest = {
        source: targetPickup,
        sourceLatitude: pickupCoords ? pickupCoords[0] : null,
        sourceLongitude: pickupCoords ? pickupCoords[1] : null,
        destination: targetDest,
        destinationLatitude: destinationCoords ? destinationCoords[0] : null,
        destinationLongitude: destinationCoords ? destinationCoords[1] : null,
        preferredDepartureTime: baseIso,
        requiredSeats: targetSeats,
        timeToleranceMinutes: flex,
      };

      try {
        const matchRes = await findMatches(matchPayload);
        const matches = matchRes.data ?? [];
        console.debug(
          "[CampusMate Search] Matching engine returned candidate matches:",
          matchRes.data
        );

        const mapped: TripResponse[] = [];
        for (const m of matches) {
          try {
            const tripDetail = await getTrip(m.tripId);
            if (tripDetail.data) {
              mapped.push(tripDetail.data);
            }
          } catch {
            // Ignore unresolvable match
          }
        }
        return mapped;
      } catch (err) {
        console.warn("[CampusMate Search] Matching engine error:", err);
        return [];
      }
    },
    onSuccess: (data) => {
      setSearchResults(data || []);
      setHasSearched(true);
    },
    onError: () => {
      toast.error("Could not fetch rides. Please try adjusting your search parameters.");
      setHasSearched(true);
    },
  });

  // Booking Mutation
  const bookingMutation = useMutation({
    mutationFn: async ({ tripId, seats }: { tripId: string; seats: number }) => {
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

  const handleStartSearch = () => {
    searchMutation.mutate(undefined);
  };


  // Filtered & Sorted Search Results - strictly excludes authenticated user's own published driver trips
  const filteredResults = useMemo(() => {
    let list = searchResults.filter((ride) => {
      if (!authUser) return true;
      const isOwner =
        (authUser.userId && (
          authUser.userId === ride.driverId ||
          authUser.userId === ride.driver?.userId ||
          authUser.userId === ride.driver?.driverId
        )) ||
        (authUser.email &&
          ride.driver?.email &&
          authUser.email.toLowerCase() === ride.driver.email.toLowerCase());
      return !isOwner;
    });

    if (activeFilter === "PRICE") {
      list.sort((a, b) => {
        const pA = Number(a.price) || 0;
        const pB = Number(b.price) || 0;
        return priceSortAsc ? pA - pB : pB - pA;
      });
    } else if (activeFilter === "TIME") {
      list.sort((a, b) => {
        const timeA = a.departureTime ? new Date(a.departureTime).getTime() : 0;
        const timeB = b.departureTime ? new Date(b.departureTime).getTime() : 0;
        return timeA - timeB;
      });
    } else if (activeFilter === "SEATS") {
      list = list.filter((r) => (r.availableSeats || 1) >= seats);
    }

    return list;
  }, [searchResults, activeFilter, priceSortAsc, seats, authUser]);



  // Handle map click when in Pin Pick Mode
  const handleMapClick = async (coords: [number, number]) => {
    if (isPickingOnMap) {
      setPickupCoords(coords);
      setIsPickingOnMap(false);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords[0]}&lon=${coords[1]}`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        const name =
          data.display_name?.split(",").slice(0, 2).join(",") ||
          `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
        setPickupAddress(name);
      } catch {
        setPickupAddress(`${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
      }

      toast.success("Pickup location updated from map.");
    }
  };

  const handleSelectCollege = (college: EnrichedCollege) => {
    setSelectedCollege(college);
    setSelectedCollegeId(college.id);
    if (quickRoute === "HOME_CAMPUS") {
      setDestinationName(college.name);
      setDestinationCoords([college.latitude, college.longitude]);
    } else {
      setPickupAddress(college.name);
      setPickupCoords([college.latitude, college.longitude]);
    }
  };

  const handleApplyHomeToCampus = () => {
    setQuickRoute("HOME_CAMPUS");
    const collegeCoords: [number, number] = [
      selectedCollege.latitude,
      selectedCollege.longitude,
    ];

    if (homeLocation) {
      setPickupAddress(homeLocation.address);
      setPickupCoords([homeLocation.latitude, homeLocation.longitude]);
    } else if (currentCoords && currentAddress) {
      setPickupAddress(currentAddress);
      setPickupCoords(currentCoords);
    } else {
      handleGetGeolocation();
    }

    setDestinationName(selectedCollege.name);
    setDestinationCoords(collegeCoords);
  };

  const handleApplyCampusToHome = () => {
    setQuickRoute("CAMPUS_HOME");
    const collegeCoords: [number, number] = [
      selectedCollege.latitude,
      selectedCollege.longitude,
    ];

    setPickupAddress(selectedCollege.name);
    setPickupCoords(collegeCoords);

    if (homeLocation) {
      setDestinationName(homeLocation.address);
      setDestinationCoords([homeLocation.latitude, homeLocation.longitude]);
    } else if (currentCoords && currentAddress) {
      setDestinationName(currentAddress);
      setDestinationCoords(currentCoords);
    } else {
      handleGetGeolocation();
    }
  };

  const formattedDeparture = useMemo(() => {
    return formatTime(selectedDate);
  }, [selectedDate]);


  return (
    <div className="relative mx-auto flex h-[calc(100vh-80px)] w-full max-w-md flex-col overflow-hidden pb-16 lg:max-w-4xl rounded-2xl border border-border shadow-large bg-surface">
      {/* ─── Top Floating Route Input Card (Stitch UI #5) ─── */}
      <div className="absolute top-4 inset-x-4 z-20 mx-auto max-w-lg rounded-2xl bg-surface/95 p-3.5 shadow-premium backdrop-blur-md border border-border space-y-2">
        {/* Origin */}
        <div
          onClick={() => setIsPickupSheetOpen(true)}
          className="flex items-center gap-3 rounded-xl bg-primary-subtle/40 px-3.5 py-2.5 border border-primary/20 cursor-pointer hover:bg-primary-subtle/60 transition group"
        >
          <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-white shadow-soft">
            <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
          </div>
          <div className="flex-1 min-w-0 font-semibold text-xs text-foreground truncate">
            {pickupAddress}
          </div>
        </div>

        {/* Destination */}
        <div
          onClick={() => setIsCollegeModalOpen(true)}
          className="flex items-center gap-3 rounded-xl bg-surface px-3.5 py-2.5 border border-border cursor-pointer hover:border-primary/50 transition group shadow-soft"
        >
          <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-emerald-600 text-white shadow-soft">
            <div className="h-1.5 w-1.5 rounded-sm bg-white"></div>
          </div>
          <div className="flex-1 min-w-0 font-semibold text-xs text-foreground truncate">
            {destinationName}
          </div>
        </div>
      </div>

      {/* ─── Center Interactive Leaflet Map ─── */}
      <div className="relative flex-1 w-full h-full">
        <MobilityMap
          center={pickupCoords || destinationCoords || [selectedCollege.latitude, selectedCollege.longitude]}
          pickupLocation={pickupCoords}
          destinationLocation={destinationCoords}
          routePolyline={routePolyline}
          interactive={true}
          onMapClick={handleMapClick}
          onLocateUser={handleGetGeolocation}
          showLocateButton={!isPickingOnMap}
        />

        {/* Map Pick Mode Banner */}
        {isPickingOnMap && (
          <div className="absolute top-32 inset-x-6 z-20 flex items-center justify-between rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-large animate-bounce">
            <span>Tap anywhere on the map to set pickup</span>
            <button
              type="button"
              onClick={() => setIsPickingOnMap(false)}
              className="rounded-lg bg-white/20 px-2 py-1 text-[11px]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ─── Bottom Sheet / Controls Panel (Stitch UI #5 & #6) ─── */}
      <div className="relative z-20 flex flex-col rounded-t-sheet bg-surface/95 p-4 shadow-premium backdrop-blur-md border-t border-border space-y-3.5 max-h-[50vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center -mt-1 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-border-secondary/70"></div>
        </div>

        {!hasSearched ? (
          <>
            {/* Quick Routes Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Quick Routes</span>
              <button
                type="button"
                onClick={() => setIsDateTimeModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDeparture}</span>
              </button>
            </div>

            {/* Quick Route Shortcut Chips */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleApplyHomeToCampus}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                  quickRoute === "HOME_CAMPUS"
                    ? "border-primary bg-primary text-white shadow-soft"
                    : "border-border bg-surface-subtle text-foreground hover:bg-surface"
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                <span className="truncate">Home → Campus</span>
              </button>

              <button
                type="button"
                onClick={handleApplyCampusToHome}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                  quickRoute === "CAMPUS_HOME"
                    ? "border-primary bg-primary text-white shadow-soft"
                    : "border-border bg-surface-subtle text-foreground hover:bg-surface"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span className="truncate">Campus → Home</span>
              </button>
            </div>

            {/* Primary Search CTA */}
            <button
              type="button"
              onClick={handleStartSearch}
              disabled={searchMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-button bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50"
            >
              <span>{searchMutation.isPending ? "Finding Rides..." : "Search Rides"}</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </>
        ) : (
          /* ─── Search Results View (Stitch UI #6) ─── */
          <div className="space-y-3.5">
            {/* Header & Filter Row */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold tracking-tight text-foreground">
                Rides near you
              </h2>
              <button
                type="button"
                onClick={() => setHasSearched(false)}
                className="text-xs font-bold text-primary hover:underline"
              >
                Edit Search
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                  activeFilter === "ALL"
                    ? "bg-primary text-white shadow-soft"
                    : "bg-surface-subtle text-foreground-secondary border border-border hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("TIME")}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                  activeFilter === "TIME"
                    ? "bg-primary text-white shadow-soft"
                    : "bg-surface-subtle text-foreground-secondary border border-border hover:text-foreground"
                }`}
              >
                Time
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFilter("PRICE");
                  setPriceSortAsc(!priceSortAsc);
                }}
                className={`flex items-center gap-1 rounded-full px-3.5 py-1 text-xs font-bold transition ${
                  activeFilter === "PRICE"
                    ? "bg-primary text-white shadow-soft"
                    : "bg-surface-subtle text-foreground-secondary border border-border hover:text-foreground"
                }`}
              >
                <span>Price</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("SEATS")}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                  activeFilter === "SEATS"
                    ? "bg-primary text-white shadow-soft"
                    : "bg-surface-subtle text-foreground-secondary border border-border hover:text-foreground"
                }`}
              >
                Seats ({seats})
              </button>
            </div>

            {/* Results List */}
            {searchMutation.isPending ? (
              <div className="py-8 text-center text-xs text-foreground-secondary animate-pulse">
                Finding available campus rides...
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-2">
                <div className="font-bold text-sm text-foreground">
                  No rides found for {formatDate(selectedDate)} at {formatTime(selectedDate)}
                </div>
                <p className="text-xs text-foreground-secondary leading-relaxed max-w-xs mx-auto">
                  Try expanding your departure flexibility window (±30m), adjusting your pickup location, or choosing another date.
                </p>
                <button
                  type="button"
                  onClick={() => setIsDateTimeModalOpen(true)}
                  className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-soft mt-2"
                >
                  Adjust Date / Time
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResults.map((ride, idx) => {
                  const isBestMatch = idx === 0;
                  const driverName = ride.driver
                    ? `${ride.driver.firstName} ${ride.driver.lastName}`.trim()
                    : "Verified Driver";
                  const vehicleText = ride.vehicle
                    ? `${ride.vehicle.brand} ${ride.vehicle.model}`.trim()
                    : "Campus Vehicle";
                  const priceText = formatCurrency(ride.price);
                  const depTime = formatTime(ride.departureTime);
                  const arrTime = formatTime(ride.arrivalTime);

                  return (
                    <div
                      key={ride.id}
                      className="relative rounded-2xl border border-border bg-surface p-4 shadow-soft hover:shadow-medium hover:border-primary/40 transition space-y-3"
                    >
                      {/* Best Match Badge */}
                      {isBestMatch && (
                        <div className="absolute -top-2.5 right-4 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-soft">
                          <Sparkles className="h-3 w-3" />
                          <span>BEST MATCH</span>
                        </div>
                      )}

                      {/* Driver & Price Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-subtle text-primary font-bold shadow-soft">
                            {driverName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-foreground">
                              {driverName}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-foreground-secondary mt-0.5">
                              <span className="text-primary font-medium">Verified Driver</span>
                              <span>•</span>
                              <span>{vehicleText}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-extrabold text-foreground">
                            {priceText}
                          </div>
                          <div className="text-[10px] text-foreground-secondary">
                            per seat
                          </div>
                        </div>
                      </div>

                      {/* Schedule Timeline Bar */}
                      <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-3 py-2 text-xs">
                        <div>
                          <span className="text-[10px] text-foreground-secondary block">
                            Departs
                          </span>
                          <span className="font-bold text-foreground">{depTime}</span>
                        </div>
                        <div className="flex-1 mx-3 border-t border-dashed border-border-secondary"></div>
                        <div className="text-right">
                          <span className="text-[10px] text-foreground-secondary block">
                            Arrives
                          </span>
                          <span className="font-bold text-foreground">{arrTime}</span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="flex items-center gap-1 rounded-lg bg-primary-subtle/60 px-2.5 py-1 text-[11px] font-bold text-primary">
                          <Users className="h-3 w-3" />
                          <span>{ride.availableSeats || 2} seats left</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/trips/${ride.id}`)}
                            className="rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTripForReview(ride);
                              setIsReviewModalOpen(true);
                            }}
                            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition active:scale-95"
                          >
                            Request Ride
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Modals ─── */}
      {/* College Selector */}
      <CollegeSelectorModal
        isOpen={isCollegeModalOpen}
        onClose={() => setIsCollegeModalOpen(false)}
        selectedCollegeId={selectedCollegeId}
        onSelect={handleSelectCollege}
      />

      {/* Date & Time Picker */}
      <DateTimePickerModal
        isOpen={isDateTimeModalOpen}
        onClose={() => setIsDateTimeModalOpen(false)}
        pickupLabel={pickupAddress}
        destinationLabel={destinationName}
        selectedDateTime={selectedDate}
        flexibilityMinutes={flexibilityMinutes}
        seats={seats}
        onConfirm={({ dateTime, flexibilityMinutes: flex, seats: sCount }) => {
          setSelectedDate(dateTime);
          setFlexibilityMinutes(flex);
          setSeats(sCount);
          searchMutation.mutate({
            date: dateTime,
            flexibility: flex,
            seatsCount: sCount,
          });
        }}


      />

      {/* Pickup Location Sheet */}
      <PickupLocationSheet
        isOpen={isPickupSheetOpen}
        onClose={() => setIsPickupSheetOpen(false)}
        onEnterMapPickMode={() => setIsPickingOnMap(true)}
        onSelectLocation={(loc) => {
          setPickupAddress(loc.address);
          if (loc.coords) setPickupCoords(loc.coords);
        }}
      />

      {/* Booking Review Modal */}
      {selectedTripForReview && (
        <BookingReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedTripForReview(null);
          }}
          trip={selectedTripForReview}
          initialSeats={seats}
          isPending={bookingMutation.isPending}
          onConfirmBooking={(confirmedSeats) => {
            bookingMutation.mutate({
              tripId: selectedTripForReview.id,
              seats: confirmedSeats,
            });
          }}
        />
      )}
    </div>
  );
}
