import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import { getTrip, updateTrip } from "@/features/trip/api/trip.api";
import { getColleges } from "@/features/college/api/college.api";
import {
  formatCurrency,
  formatTime,
  toLocalDateTimeString,
  addMinutesToLocalDateTime,
} from "@/utils/format";

export default function EditTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["trips", tripId],
    queryFn: () => (tripId ? getTrip(tripId) : Promise.resolve(null)),
    enabled: Boolean(tripId),
  });
  const trip = data?.data;

  const { data: collegesRes } = useQuery({
    queryKey: ["colleges"],
    queryFn: getColleges,
  });
  const colleges = collegesRes?.data ?? [];

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState(40);

  useEffect(() => {
    if (trip) {
      setSource(trip.source);
      setDestination(trip.destination);
      if (trip.departureTime) {
        // e.g. "2026-08-16T08:30:00"
        const parts = trip.departureTime.split("T");
        if (parts.length >= 2) {
          setDepartureDate(parts[0]);
          setDepartureTime(parts[1].slice(0, 5));
        } else {
          const dt = new Date(trip.departureTime);
          setDepartureDate(dt.toISOString().slice(0, 10));
          setDepartureTime(dt.toTimeString().slice(0, 5));
        }
      }
      setSeats(trip.availableSeats);
      setPrice(Number(trip.price) || 40);
    }
  }, [trip]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateTrip(tripId as string, payload),
    onSuccess: () => {
      toast.success("Trip updated successfully.");
      qc.invalidateQueries({ queryKey: ["trips", tripId] });
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      navigate(`/driver/trips/${tripId}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not update trip.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;

    const departureIso = toLocalDateTimeString(departureDate, departureTime);
    const arrivalIso = addMinutesToLocalDateTime(departureIso, 45);

    const payload = {
      source: source.trim(),
      destination: destination.trim(),
      departureTime: departureIso,
      arrivalTime: arrivalIso,
      availableSeats: seats,
      price: price.toString(),
    };

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-12 text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-danger mx-auto" />
        <h2 className="text-base font-bold text-foreground">Trip Not Found</h2>
        <button
          type="button"
          onClick={() => navigate("/driver/trips")}
          className="text-xs font-bold text-primary hover:underline"
        >
          Back to My Trips
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-2xl space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate(`/driver/trips/${tripId}`))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Edit Trip</h1>
          <p className="text-xs text-foreground-secondary">
            Update seats, price, and schedule
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Route Card */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-3">
          <span className="font-extrabold text-xs text-foreground block">
            Locations
          </span>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Pickup (Origin)
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface-subtle px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Destination (Campus)
            </label>
            <select
              value={colleges.find((c) => c.name === destination)?.id ?? ""}
              onChange={(e) =>
                setDestination(colleges.find((c) => c.id === e.target.value)?.name ?? "")
              }
              className="w-full rounded-2xl border border-border bg-surface-subtle px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">{destination || "Select Campus"}</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule Card */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-3">
          <span className="font-extrabold text-xs text-foreground block">
            Schedule
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Departure Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-subtle px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" />
                  <span>Time</span>
                </label>
                <span className="font-extrabold text-primary text-[11px]">
                  {formatTime(departureTime)}
                </span>
              </div>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-subtle px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Seats & Price Card (Indian Rupees ₹) */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-4">
          <span className="font-extrabold text-xs text-foreground block">
            Seats & Pricing (₹)
          </span>

          {/* Seats Stepper */}
          <div className="rounded-2xl bg-surface-subtle p-3.5 border border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-foreground block">
                Available Seats
              </span>
              <span className="text-[11px] text-foreground-secondary">
                Seats offered for booking
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSeats((prev) => Math.max(1, prev - 1))}
                disabled={seats <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface font-bold text-foreground hover:bg-surface-subtle disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <span className="text-sm font-black text-foreground min-w-[1.5rem] text-center font-mono">
                {seats}
              </span>

              <button
                type="button"
                onClick={() => setSeats((prev) => Math.min(6, prev + 1))}
                disabled={seats >= 6}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface font-bold text-foreground hover:bg-surface-subtle disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Fare Input in ₹ */}
          <div className="rounded-2xl bg-surface-subtle p-3.5 border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Price per seat (₹)</span>
              <span className="font-bold text-primary">
                Est. Total: {formatCurrency(seats * price)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrice((p) => Math.max(10, p - 5))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface font-bold text-foreground"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <div className="relative flex-1">
                <span className="absolute left-3 top-2 font-bold text-xs text-foreground-muted">
                  ₹
                </span>
                <input
                  type="number"
                  step="5"
                  min="10"
                  max="500"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-surface pl-7 pr-3 py-1.5 text-center text-base font-black text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setPrice((p) => p + 5)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface font-bold text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1 rounded-button bg-primary py-3.5 px-4 text-xs font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99] flex items-center justify-center gap-1.5"
          >
            {updateMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save Changes</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-button border border-border bg-surface px-5 py-3.5 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
