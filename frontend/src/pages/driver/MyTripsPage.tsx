import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Car,
  Users,
  Plus,
  Play,
  CheckCircle2,
  Edit2,
  ChevronRight,
  Loader2,
  XCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { getMyTrips, startTrip, completeTrip, cancelTrip, deleteTrip } from "@/features/trip/api/trip.api";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { getStatusBadgeClass, getStatusLabel } from "@/utils/status";
import type { TripResponse } from "@/features/trip/types/trip.types";

type TripTab = "ALL" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export default function MyTripsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<TripTab>("SCHEDULED");
  const [tripToCancel, setTripToCancel] = useState<TripResponse | null>(null);
  const [tripToDelete, setTripToDelete] = useState<TripResponse | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["driver", "my-trips"],
    queryFn: getMyTrips,
    staleTime: 1000 * 5,
    refetchInterval: 5000,
  });

  const trips = data?.data ?? [];

  const filteredTrips = useMemo(() => {
    const list = trips.filter((t) => {
      if (activeTab === "ALL") return true;
      return t.status === activeTab;
    });

    return list.sort((a, b) => {
      const timeA = a.departureTime ? new Date(a.departureTime).getTime() : 0;
      const timeB = b.departureTime ? new Date(b.departureTime).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createdB - createdA;
    });
  }, [trips, activeTab]);

  // Trip Mutations
  const startMut = useMutation({
    mutationFn: (id: string) => startTrip(id),
    onSuccess: (_res, id) => {
      toast.success("Trip started! Live tracking is now active.");
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      navigate(`/driver/trips/${id}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not start trip.");
    },
  });

  const completeMut = useMutation({
    mutationFn: (id: string) => completeTrip(id),
    onSuccess: () => {
      toast.success("Trip completed successfully.");
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not complete trip.");
    },
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelTrip(id),
    onSuccess: () => {
      toast.success("Trip cancelled successfully. All booked riders were notified.");
      setTripToCancel(null);
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      qc.invalidateQueries({ queryKey: ["driver", "bookings"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Unable to cancel this trip right now. Please try again.";
      toast.error(msg);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTrip(id),
    onSuccess: () => {
      toast.success("Trip removed successfully.");
      setTripToDelete(null);
      qc.invalidateQueries({ queryKey: ["driver", "my-trips"] });
      qc.invalidateQueries({ queryKey: ["driver", "bookings"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Unable to delete this trip. Please try again.";
      toast.error(msg);
    },
  });

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-4xl space-y-5 animate-in fade-in duration-300">
      {/* Top Header & CTA */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            My Trips
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Manage your scheduled rides and live trips.
          </p>
        </div>

        <Link
          to="/driver/trips/create"
          className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
        >
          <Plus className="h-4 w-4" />
          <span>Offer Ride</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-extrabold no-scrollbar">
        {[
          { key: "SCHEDULED", label: "Scheduled" },
          { key: "IN_PROGRESS", label: "In Progress" },
          { key: "COMPLETED", label: "Completed" },
          { key: "CANCELLED", label: "Cancelled" },
          { key: "ALL", label: "All" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as TripTab)}
            className={`rounded-2xl px-4 py-2 transition shrink-0 ${
              activeTab === tab.key
                ? "bg-primary text-white shadow-soft"
                : "bg-surface text-foreground-secondary hover:text-foreground border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-subtle text-foreground-secondary mx-auto">
              <Car className="h-6 w-6" />
            </div>
            <div className="font-bold text-sm text-foreground">No trips found</div>
            <p className="text-xs text-foreground-secondary max-w-xs mx-auto">
              {activeTab === "ALL"
                ? "You haven't scheduled any commute offers yet."
                : `No ${activeTab.toLowerCase()} trips found.`}
            </p>
            <Link
              to="/driver/trips/create"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Offer a Commute</span>
            </Link>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const isLive = trip.status === "IN_PROGRESS";
            const isScheduled = trip.status === "SCHEDULED";
            const isCancelled = trip.status === "CANCELLED";

            return (
              <div
                key={trip.id}
                className="rounded-3xl border border-border bg-surface p-5 shadow-soft hover:shadow-medium transition space-y-4"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${getStatusBadgeClass(
                          trip.status
                        )}`}
                      >
                        {getStatusLabel(trip.status)}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {formatDateTime(trip.departureTime)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-foreground">
                      {formatCurrency(trip.price)}
                    </span>
                    <span className="text-[10px] text-foreground-secondary block">/ seat</span>
                  </div>
                </div>

                {/* Route */}
                <div className="space-y-2 rounded-2xl bg-surface-subtle p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span className="font-semibold text-foreground truncate">{trip.source}</span>
                  </div>
                  <div className="ml-1 border-l border-dashed border-border pl-3.5 py-0.5" />
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-foreground truncate">{trip.destination}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs">
                  <span className="flex items-center gap-1 text-foreground-secondary font-semibold">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>{trip.availableSeats} available seats</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {isScheduled && (
                      <>
                        <button
                          type="button"
                          onClick={() => setTripToCancel(trip)}
                          className="rounded-xl border border-rose-200 text-rose-600 dark:border-rose-900/50 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-1.5 font-bold transition flex items-center gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTripToDelete(trip)}
                          className="rounded-xl border border-border text-foreground-secondary hover:text-danger hover:border-danger/30 px-2.5 py-1.5 font-bold transition flex items-center gap-1"
                          title="Delete trip if no bookings"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <Link
                          to={`/driver/trips/${trip.id}/edit`}
                          className="rounded-xl border border-border bg-surface px-3 py-1.5 font-bold text-foreground hover:bg-surface-subtle transition flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => startMut.mutate(trip.id)}
                          disabled={startMut.isPending}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 font-bold text-white shadow-soft transition flex items-center gap-1.5"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Start Trip</span>
                        </button>
                      </>
                    )}

                    {isCancelled && (
                      <button
                        type="button"
                        onClick={() => setTripToDelete(trip)}
                        className="rounded-xl border border-border text-foreground-secondary hover:text-danger hover:border-danger/30 px-3 py-1.5 font-bold transition flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    )}

                    {isLive && (
                      <button
                        type="button"
                        onClick={() => completeMut.mutate(trip.id)}
                        disabled={completeMut.isPending}
                        className="rounded-xl bg-primary hover:bg-primary-hover px-3.5 py-1.5 font-bold text-white shadow-soft transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Complete Trip</span>
                      </button>
                    )}

                    <Link
                      to={`/driver/trips/${trip.id}`}
                      className="rounded-xl bg-primary-subtle px-3.5 py-1.5 font-bold text-primary hover:bg-primary/20 transition flex items-center gap-1"
                    >
                      <span>Live View</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Trip Cancellation */}
      {tripToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-surface border border-border p-6 shadow-large space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-subtle text-danger mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-foreground">Cancel this trip?</h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                This scheduled commute will be cancelled. All passengers with active bookings will be notified immediately.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTripToCancel(null)}
                className="flex-1 rounded-2xl border border-border py-3 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
              >
                Keep Trip
              </button>
              <button
                type="button"
                onClick={() => cancelMut.mutate(tripToCancel.id)}
                disabled={cancelMut.isPending}
                className="flex-1 rounded-2xl bg-danger py-3 text-xs font-bold text-white hover:bg-danger/90 transition shadow-soft flex items-center justify-center gap-2"
              >
                {cancelMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Cancel Trip"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Trip Deletion */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-surface border border-border p-6 shadow-large space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-subtle text-foreground-secondary mx-auto">
              <Trash2 className="h-6 w-6 text-danger" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-foreground">Delete this trip?</h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                This trip will be permanently removed from your active schedule.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="flex-1 rounded-2xl border border-border py-3 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
              >
                Keep Trip
              </button>
              <button
                type="button"
                onClick={() => deleteMut.mutate(tripToDelete.id)}
                disabled={deleteMut.isPending}
                className="flex-1 rounded-2xl bg-danger py-3 text-xs font-bold text-white hover:bg-danger/90 transition shadow-soft flex items-center justify-center gap-2"
              >
                {deleteMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete Trip"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}