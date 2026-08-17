import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Calendar,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  Fuel,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";

import { getColleges } from "@/features/college/api/college.api";
import { createTrip } from "@/features/trip/api/trip.api";
import { getMyVehicle } from "@/features/driver/vehicle/api/vehicle.api";
import { useLocationStore } from "@/store/location.store";
import { MobilityMap } from "@/components/maps/MobilityMap";
import { reverseGeocode } from "@/features/location/services/geocoding";
import { fetchRoadRoute } from "@/features/location/services/routing.service";
import { VehicleVisual } from "@/components/vehicle/VehicleVisual";
import {
  formatCurrency,
  formatDate,
  formatTime,
  toLocalDateTimeString,
  addMinutesToLocalDateTime,
} from "@/utils/format";
import type { CollegeResponse } from "@/features/college/types/college.types";

export default function CreateTripPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const locationStore = useLocationStore();

  // Queries
  const { data: collegesRes } = useQuery({
    queryKey: ["colleges"],
    queryFn: getColleges,
    staleTime: 1000 * 60 * 60,
  });
  const colleges: CollegeResponse[] = collegesRes?.data ?? [];

  const { data: vehicleRes, isLoading: vehicleLoading } = useQuery({
    queryKey: ["driver", "vehicle", "me"],
    queryFn: getMyVehicle,
    staleTime: 1000 * 60 * 2,
  });
  const vehicle = vehicleRes?.data ?? null;

  // Route Mode: 'HOME_TO_COLLEGE' | 'COLLEGE_TO_HOME'
  const [routeMode, setRouteMode] = useState<"HOME_TO_COLLEGE" | "COLLEGE_TO_HOME">(
    "HOME_TO_COLLEGE"
  );

  // Form State
  const [source, setSource] = useState("");
  const [sourceCoords, setSourceCoords] = useState<[number, number] | null>(null);

  const [destination, setDestination] = useState("");
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");

  const [departureDate, setDepartureDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [departureTime, setDepartureTime] = useState("08:30");

  // Seats & Price State (Indian Rupees ₹)
  const [seats, setSeats] = useState(2);
  const [price, setPrice] = useState(40);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Set default college and coordinates on load
  useEffect(() => {
    if (colleges.length > 0 && !selectedCollegeId) {
      const defaultCol = colleges[0];
      setSelectedCollegeId(defaultCol.id);
      const colCoords: [number, number] = [
        defaultCol.latitude || 16.4839,
        defaultCol.longitude || 80.6937,
      ];
      const homeAddr = locationStore.homeLocation?.address || "Benz Circle Vijayawada";
      const homeCoords: [number, number] = [
        locationStore.homeLocation?.latitude || 16.5062,
        locationStore.homeLocation?.longitude || 80.648,
      ];

      if (routeMode === "HOME_TO_COLLEGE") {
        setSource(homeAddr);
        setSourceCoords(homeCoords);
        setDestination(defaultCol.name);
        setDestCoords(colCoords);
      } else {
        setSource(defaultCol.name);
        setSourceCoords(colCoords);
        setDestination(homeAddr);
        setDestCoords(homeCoords);
      }
    }
  }, [colleges, selectedCollegeId, routeMode, locationStore.homeLocation]);

  // Adjust seat limits based on real registered vehicle capacity
  useEffect(() => {
    if (vehicle?.maxPassengerCapacity) {
      const maxAvailable = vehicle.maxPassengerCapacity;
      setSeats((prev) => Math.min(Math.max(1, prev), maxAvailable));
    }
  }, [vehicle]);

  // Real road route polyline (OSRM preview)
  const [routePolyline, setRoutePolyline] = useState<[number, number][] | null>(null);

  useEffect(() => {
    if (!sourceCoords || !destCoords) {
      setRoutePolyline(null);
      return;
    }
    let isCancelled = false;
    fetchRoadRoute(sourceCoords, destCoords).then((coords) => {
      if (!isCancelled) {
        setRoutePolyline(coords);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [sourceCoords?.[0], sourceCoords?.[1], destCoords?.[0], destCoords?.[1]]);

  // Handle GPS detection
  const handleDetectGPS = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const geoResult = await reverseGeocode(lat, lng);
          const addr = geoResult.formattedAddress;
          if (routeMode === "HOME_TO_COLLEGE") {
            setSource(addr);
            setSourceCoords([lat, lng]);
          } else {
            setDestination(addr);
            setDestCoords([lat, lng]);
          }
          toast.success("Location detected from GPS");
        } catch {
          const fallback = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          if (routeMode === "HOME_TO_COLLEGE") {
            setSource(fallback);
            setSourceCoords([lat, lng]);
          } else {
            setDestination(fallback);
            setDestCoords([lat, lng]);
          }
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast.error("Unable to get current GPS location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Switch Route Mode Shortcut tabs
  const handleRouteModeChange = (mode: "HOME_TO_COLLEGE" | "COLLEGE_TO_HOME") => {
    setRouteMode(mode);
    const col = colleges.find((c) => c.id === selectedCollegeId) || colleges[0];
    const collegeCoords: [number, number] = [
      col?.latitude || 16.4839,
      col?.longitude || 80.6937,
    ];
    const collegeName = col?.name || "Campus";

    const homeAddr =
      routeMode === "HOME_TO_COLLEGE"
        ? source || locationStore.homeLocation?.address || "Home Location"
        : destination || locationStore.homeLocation?.address || "Home Location";
    const homeCoords: [number, number] =
      routeMode === "HOME_TO_COLLEGE"
        ? sourceCoords || [16.5062, 80.648]
        : destCoords || [16.5062, 80.648];

    if (mode === "HOME_TO_COLLEGE") {
      setSource(homeAddr);
      setSourceCoords(homeCoords);
      setDestination(collegeName);
      setDestCoords(collegeCoords);
    } else {
      setSource(collegeName);
      setSourceCoords(collegeCoords);
      setDestination(homeAddr);
      setDestCoords(homeCoords);
    }
  };

  // Handle selecting a different college
  const handleCollegeChange = (colId: string) => {
    setSelectedCollegeId(colId);
    const col = colleges.find((c) => c.id === colId);
    if (!col) return;

    const colCoords: [number, number] = [
      col.latitude || 16.4839,
      col.longitude || 80.6937,
    ];

    if (routeMode === "HOME_TO_COLLEGE") {
      setDestination(col.name);
      setDestCoords(colCoords);
    } else {
      setSource(col.name);
      setSourceCoords(colCoords);
    }
  };

  // Safe back navigation
  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/driver/dashboard");
    }
  };

  // Create Trip Mutation
  const createMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      toast.success("Trip published successfully!");
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      qc.invalidateQueries({ queryKey: ["trips"] });
      setIsPricingModalOpen(false);
      navigate("/driver/trips");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Could not publish trip. Ensure you have an approved vehicle.";
      toast.error(msg);
    },
  });

  const handleOpenPricingModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!source.trim()) {
      toast.error("Please enter a pickup location.");
      return;
    }
    if (!destination.trim()) {
      toast.error("Please enter a destination.");
      return;
    }
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      toast.error("Pickup and destination cannot be the same location.");
      return;
    }
    if (!departureDate) {
      toast.error("Please choose a departure date.");
      return;
    }
    if (!departureTime) {
      toast.error("Please choose a departure time.");
      return;
    }
    if (vehicleLoading) {
      toast.info("Loading your registered vehicle details...");
      return;
    }
    if (!vehicle || !vehicle.maxPassengerCapacity || vehicle.maxPassengerCapacity < 1) {
      toast.error("Unable to load your registered vehicle. Please ensure you have an active vehicle registered.");
      return;
    }

    setIsPricingModalOpen(true);
  };

  const handlePublishTrip = () => {
    // Produce local wall-clock ISO string without UTC conversion skew
    const departureIso = toLocalDateTimeString(departureDate, departureTime);
    const arrivalIso = addMinutesToLocalDateTime(departureIso, 45);

    const payload = {
      source: source.trim(),
      sourceLatitude: sourceCoords ? sourceCoords[0] : null,
      sourceLongitude: sourceCoords ? sourceCoords[1] : null,
      destination: destination.trim(),
      destinationLatitude: destCoords ? destCoords[0] : null,
      destinationLongitude: destCoords ? destCoords[1] : null,
      departureTime: departureIso,
      arrivalTime: arrivalIso,
      availableSeats: seats,
      price: Number(price),
    };

    createMutation.mutate(payload);
  };

  const maxCapacity = vehicle?.maxPassengerCapacity ? vehicle.maxPassengerCapacity : 1;
  const estTotalEarnings = seats * price;

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-3xl space-y-5 animate-in fade-in duration-300">
      {/* Header & Back */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Create Trip</h1>
          <p className="text-xs text-foreground-secondary">
            Offer empty seats to fellow students
          </p>
        </div>
      </div>

      <form onSubmit={handleOpenPricingModal} className="space-y-5">
        {/* Route Details Card */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-4">
          <span className="font-extrabold text-sm text-foreground block">
            Route Details
          </span>

          {/* Quick Route Shortcut Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-subtle rounded-2xl border border-border text-xs font-extrabold">
            <button
              type="button"
              onClick={() => handleRouteModeChange("HOME_TO_COLLEGE")}
              className={`py-2.5 px-3 rounded-xl transition ${
                routeMode === "HOME_TO_COLLEGE"
                  ? "bg-primary text-white shadow-soft"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              Home to College
            </button>
            <button
              type="button"
              onClick={() => handleRouteModeChange("COLLEGE_TO_HOME")}
              className={`py-2.5 px-3 rounded-xl transition ${
                routeMode === "COLLEGE_TO_HOME"
                  ? "bg-primary text-white shadow-soft"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              College to Home
            </button>
          </div>

          {/* FIELD 1: Pickup Location */}
          {routeMode === "HOME_TO_COLLEGE" ? (
            /* Home to College: Field 1 is Home / Custom Pickup Input */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-foreground">Pickup Location (Home / Area)</label>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isLocating}
                  className="text-primary font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Navigation className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`} />
                  <span>{isLocating ? "Locating..." : "Use Current GPS"}</span>
                </button>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-primary" />
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Enter starting pickup address..."
                  className="w-full rounded-2xl border border-border bg-surface-subtle pl-10 pr-4 py-3 text-xs font-semibold text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          ) : (
            /* College to Home: Field 1 is College Selector Dropdown */
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Origin Campus (College)
              </label>
              <select
                value={selectedCollegeId}
                onChange={(e) => handleCollegeChange(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-subtle px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {colleges.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} {col.city ? `(${col.city})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* FIELD 2: Destination Location */}
          {routeMode === "HOME_TO_COLLEGE" ? (
            /* Home to College: Field 2 is College Selector Dropdown */
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Destination Campus
              </label>
              <select
                value={selectedCollegeId}
                onChange={(e) => handleCollegeChange(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-subtle px-4 py-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {colleges.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} {col.city ? `(${col.city})` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* College to Home: Field 2 is Home / Custom Dropoff Input */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-foreground">Dropoff Location (Home / Area)</label>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isLocating}
                  className="text-primary font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Navigation className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`} />
                  <span>{isLocating ? "Locating..." : "Use Current GPS"}</span>
                </button>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-primary" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter dropoff destination address..."
                  className="w-full rounded-2xl border border-border bg-surface-subtle pl-10 pr-4 py-3 text-xs font-semibold text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* Live Leaflet Route Map Preview Card */}
          <div className="rounded-2xl border border-border overflow-hidden shadow-inner h-44 bg-surface-subtle">
            <MobilityMap
              pickupLocation={sourceCoords}
              destinationLocation={destCoords}
              routePolyline={routePolyline}
              interactive={false}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Schedule & Vehicle Card */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-4">
          <span className="font-extrabold text-sm text-foreground block">
            Schedule & Vehicle
          </span>

          <div className="grid grid-cols-2 gap-3">
            {/* Departure Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>Departure Date</span>
              </label>
              <input
                type="date"
                value={departureDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-subtle px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Departure Time */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Departure Time</span>
                </label>
                <span className="font-extrabold text-primary text-[11px]">
                  {formatTime(departureTime)}
                </span>
              </div>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-subtle px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Active Vehicle Selector Card */}
          {vehicleLoading ? (
            <div className="rounded-2xl border border-border bg-surface-subtle p-4 text-center text-xs text-foreground-secondary flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading registered vehicle details...</span>
            </div>
          ) : vehicle ? (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-subtle p-3.5">
              <div className="flex items-center gap-3">
                <VehicleVisual type={vehicle.vehicleType} size="md" />
                <div>
                  <div className="font-bold text-xs text-foreground flex items-center gap-2">
                    <span>{vehicle.brand} {vehicle.model}</span>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-extrabold">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-foreground-secondary font-mono mt-0.5">
                    {vehicle.registrationNumber} • Max {vehicle.maxPassengerCapacity} Seat{vehicle.maxPassengerCapacity > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/driver/vehicle")}
                className="text-[11px] font-bold text-primary hover:underline shrink-0 ml-2"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-danger/30 bg-danger-subtle p-4 text-center space-y-1 text-xs">
              <p className="font-bold text-danger">No active vehicle found.</p>
              <button
                type="button"
                onClick={() => navigate("/driver/vehicle")}
                className="text-primary font-bold hover:underline"
              >
                + Register a vehicle first
              </button>
            </div>
          )}
        </div>

        {/* Primary CTA: Next */}
        <button
          type="submit"
          className="w-full rounded-button bg-primary py-4 px-6 text-sm font-extrabold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>Next — Set Seats & Price (₹)</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </form>

      {/* ─── SEATS & PRICE MODAL (Indian Rupees ₹) ─── */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-surface p-6 shadow-premium space-y-5 animate-in slide-in-from-bottom-5 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Seats & Price
                </h3>
                <p className="text-xs text-foreground-secondary">
                  {formatDate(departureDate)} · {formatTime(departureTime)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPricingModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-secondary hover:bg-surface-subtle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Available Seats Stepper */}
            <div className="rounded-2xl bg-surface-subtle p-4 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-foreground block">
                    Available Seats
                  </span>
                  <span className="text-[11px] text-foreground-secondary">
                    Max capacity: {maxCapacity} seat{maxCapacity > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSeats((prev) => Math.max(1, prev - 1))}
                    disabled={seats <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface font-extrabold text-foreground hover:bg-surface-subtle active:scale-95 disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="text-base font-black text-foreground min-w-[2rem] text-center font-mono">
                    {seats}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSeats((prev) => Math.min(maxCapacity, prev + 1))}
                    disabled={seats >= maxCapacity}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface font-extrabold text-foreground hover:bg-surface-subtle active:scale-95 disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Fare Per Seat Controls in Indian Rupees (₹) */}
            <div className="rounded-2xl bg-surface-subtle p-4 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-foreground">
                  Price Per Seat (₹)
                </span>
                <span className="text-xs font-bold text-primary">
                  Recommended: ₹40
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPrice((prev) => Math.max(10, prev - 5))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface font-extrabold text-foreground hover:bg-surface-subtle"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-2.5 font-bold text-sm text-foreground-muted">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="5"
                    min="10"
                    max="500"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-surface pl-8 pr-4 py-2 text-center text-lg font-black text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setPrice((prev) => prev + 5)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface font-extrabold text-foreground hover:bg-surface-subtle"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Preset Buttons (₹) */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {[30, 40, 50, 60].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPrice(val)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold border transition ${
                      price === val
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Total Earnings Callout */}
            <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-4 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Est. Total Earnings
                </span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(estTotalEarnings)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-300/80">
                <Fuel className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Offsets commute fuel and maintenance costs</span>
              </div>
            </div>

            {/* Publish Ride Action */}
            <button
              type="button"
              onClick={handlePublishTrip}
              disabled={createMutation.isPending}
              className="w-full rounded-button bg-primary py-4 px-6 text-sm font-extrabold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing Trip...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Publish Ride ✓</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}