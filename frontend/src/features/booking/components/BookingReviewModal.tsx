import { useState } from "react";
import { ArrowLeft, User, Calendar, Clock, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatTime, formatDate } from "@/utils/format";
import type { TripResponse } from "@/features/trip/types/trip.types";

interface BookingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripResponse;
  initialSeats?: number;
  isPending?: boolean;
  onConfirmBooking: (seats: number) => void;
}

export function BookingReviewModal({
  isOpen,
  onClose,
  trip,
  initialSeats = 1,
  isPending = false,
  onConfirmBooking,
}: BookingReviewModalProps) {
  const [seats, setSeats] = useState(initialSeats);

  if (!isOpen) return null;

  const unitPrice = Number(trip.price) || 40;
  const subtotal = unitPrice * seats;
  const platformFee = 5; // ₹5 platform fee
  const total = subtotal + platformFee;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-t-sheet sm:rounded-dialog bg-surface shadow-premium border border-border overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-border-secondary/60"></div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 p-5 pb-3 border-b border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-subtle text-foreground hover:bg-surface-elevated transition"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Review Request
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Route Box */}
          <div className="rounded-2xl border border-border bg-surface-subtle p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex flex-col items-center gap-1">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-primary bg-white"></div>
                <div className="h-8 w-0.5 bg-border-secondary"></div>
                <div className="h-3.5 w-3.5 rounded-sm bg-primary"></div>
              </div>
              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <span className="text-[11px] font-bold text-foreground-secondary uppercase tracking-wider">
                    Pickup
                  </span>
                  <div className="font-semibold text-sm text-foreground truncate">
                    {trip.source}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-foreground-secondary uppercase tracking-wider">
                    Drop-off
                  </span>
                  <div className="font-semibold text-sm text-foreground truncate">
                    {trip.destination}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border-subtle pt-3 flex items-center justify-between text-xs text-foreground-secondary">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{formatDate(trip.departureTime)}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{formatTime(trip.departureTime)}</span>
              </div>
            </div>
          </div>

          {/* Driver & Vehicle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-surface">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-subtle text-primary font-bold">
                {trip.driver?.firstName?.[0] || <User className="h-5 w-5" />}
              </div>
              <div>
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <span>{trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : "Campus Driver"}</span>
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="text-xs text-foreground-secondary mt-0.5">
                  {trip.vehicle
                    ? `${trip.vehicle.brand} ${trip.vehicle.model} • ${trip.vehicle.color}`
                    : "Verified Campus Vehicle"}
                </div>
              </div>
            </div>
            {trip.vehicle?.registrationNumber && (
              <span className="rounded-lg bg-surface-subtle px-2 py-1 text-[11px] font-mono font-bold text-foreground border border-border">
                {trip.vehicle.registrationNumber}
              </span>
            )}
          </div>

          {/* Seats Selection */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-surface-subtle">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Reserved Seats
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSeats((s) => Math.max(1, s - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-foreground shadow-soft border border-border font-bold disabled:opacity-40"
                disabled={seats <= 1}
              >
                -
              </button>
              <span className="text-sm font-bold">{seats}</span>
              <button
                type="button"
                onClick={() => setSeats((s) => Math.min(trip.availableSeats || 4, s + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-foreground shadow-soft border border-border font-bold disabled:opacity-40"
                disabled={seats >= (trip.availableSeats || 4)}
              >
                +
              </button>
            </div>
          </div>

          {/* Fare Breakdown in Indian Rupees (₹) */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-2 text-xs">
            <div className="flex justify-between text-foreground-secondary">
              <span>Ride Fare ({seats} seat{seats > 1 ? "s" : ""})</span>
              <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-foreground-secondary">
              <span>Campus Platform Fee</span>
              <span className="font-semibold text-foreground">{formatCurrency(platformFee)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-sm font-bold text-foreground">
              <span>Total Payment</span>
              <span className="text-primary text-base font-extrabold">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-surface">
          <Button
            type="button"
            loading={isPending}
            onClick={() => onConfirmBooking(seats)}
            className="w-full py-3.5 text-sm font-bold"
          >
            Send Request ▶
          </Button>
        </div>
      </div>
    </div>
  );
}
