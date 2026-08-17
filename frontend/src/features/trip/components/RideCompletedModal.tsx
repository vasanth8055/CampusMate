import { useState } from "react";
import { Check, Star, Calendar, CreditCard, Car } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/format";

interface RideCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripSummary?: {
    driverName?: string;
    driverRating?: number;
    vehicleModel?: string;
    source?: string;
    destination?: string;
    departureTime?: string;
    arrivalTime?: string;
    fare?: number | string;
    date?: string;
  };
  onSubmitFeedback?: (rating: number, feedback: string) => void;
}

export function RideCompletedModal({
  isOpen,
  onClose,
  tripSummary,
  onSubmitFeedback,
}: RideCompletedModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  if (!isOpen) return null;

  const handleDone = () => {
    if (onSubmitFeedback) {
      onSubmitFeedback(rating, feedbackText);
    }
    onClose();
  };

  const driverName = tripSummary?.driverName || "Campus Driver";
  const driverRating = tripSummary?.driverRating || 5.0;
  const vehicle = tripSummary?.vehicleModel || "Verified Vehicle";
  const source = tripSummary?.source || "Pickup Location";
  const destination = tripSummary?.destination || "Dropoff Destination";
  const departureTime = tripSummary?.departureTime || "";
  const arrivalTime = tripSummary?.arrivalTime || "";
  const fare = formatCurrency(tripSummary?.fare || 0);
  const date = tripSummary?.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[95vh] w-full max-w-md flex-col rounded-dialog bg-surface shadow-premium border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Success Checkmark & Title */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mb-3 shadow-soft">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              Ride Completed
            </h2>
            <p className="text-xs text-foreground-secondary mt-1 max-w-[280px]">
              Your trip from {source} to {destination} was successful.
            </p>
          </div>

          {/* Trip Summary Card */}
          <div className="rounded-2xl border border-border bg-surface-subtle p-4 space-y-4">
            {/* Driver Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle text-primary font-bold">
                  {driverName[0]}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-foreground-secondary">
                    Driven by
                  </div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1">
                    <span>{driverName}</span>
                    <span className="text-amber-500 text-xs">★ {driverRating}</span>
                  </div>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-xl bg-primary-subtle/80 px-2.5 py-1 text-xs font-bold text-primary">
                <Car className="h-3.5 w-3.5" />
                <span>{vehicle}</span>
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-3 border-t border-border-subtle pt-3">
              <div className="flex items-start justify-between text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-primary-subtle"></div>
                  <div>
                    <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">
                      Pickup
                    </span>
                    <div className="font-semibold text-foreground">{source}</div>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-foreground">
                  <span className="text-[10px] text-foreground-secondary block">Time</span>
                  {departureTime}
                </div>
              </div>

              <div className="flex items-start justify-between text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-secondary-subtle"></div>
                  <div>
                    <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">
                      Dropoff
                    </span>
                    <div className="font-semibold text-foreground">{destination}</div>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-foreground">
                  <span className="text-[10px] text-foreground-secondary block">Time</span>
                  {arrivalTime}
                </div>
              </div>
            </div>

            {/* Footer metadata */}
            <div className="border-t border-border-subtle pt-3 flex items-center justify-between text-xs text-foreground-secondary font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                <span>{fare} • Student Pass</span>
              </div>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <h3 className="text-center font-bold text-base text-foreground">
              How was your ride?
            </h3>

            {/* Interactive 5-Star Rating */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-2xl transition hover:scale-125 focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-7 w-7 transition ${
                        filled
                          ? "fill-amber-400 text-amber-400"
                          : "fill-transparent text-foreground-muted hover:text-amber-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <textarea
              rows={2}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Leave a compliment or feedback (optional)"
              className="w-full rounded-xl border border-border bg-surface-subtle p-3 text-xs text-foreground placeholder:text-foreground-muted focus:border-primary focus:bg-surface focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-surface">
          <Button
            type="button"
            onClick={handleDone}
            className="w-full py-3 text-sm font-bold"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
