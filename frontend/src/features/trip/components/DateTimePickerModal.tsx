import { useState, useMemo, useEffect } from "react";
import { Clock, Minus, Plus, X, ArrowRight } from "lucide-react";

interface DateTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickupLabel: string;
  destinationLabel: string;
  selectedDateTime: Date;
  flexibilityMinutes: number;
  seats: number;
  onConfirm: (data: {
    dateTime: Date;
    flexibilityMinutes: number;
    seats: number;
  }) => void;
}

export function DateTimePickerModal({
  isOpen,
  onClose,
  pickupLabel,
  destinationLabel,
  selectedDateTime,
  flexibilityMinutes: initialFlexibility = 15,
  seats: initialSeats = 1,
  onConfirm,
}: DateTimePickerModalProps) {
  const [selectedDateOffset, setSelectedDateOffset] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(selectedDateTime);
    target.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(6, diff >= 0 ? diff : 0));
  });

  const [timeString, setTimeString] = useState(() => {
    const hours = String(selectedDateTime.getHours()).padStart(2, "0");
    const minutes = String(selectedDateTime.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [flexibility, setFlexibility] = useState(initialFlexibility);
  const [seatCount, setSeatCount] = useState(initialSeats);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const target = new Date(selectedDateTime);
      target.setHours(0, 0, 0, 0);
      const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setSelectedDateOffset(Math.max(0, Math.min(6, diff >= 0 ? diff : 0)));

      const hours = String(selectedDateTime.getHours()).padStart(2, "0");
      const minutes = String(selectedDateTime.getMinutes()).padStart(2, "0");
      setTimeString(`${hours}:${minutes}`);
      setFlexibility(initialFlexibility);
      setSeatCount(initialSeats);
      setIsEditingTime(false);
    }
  }, [isOpen, selectedDateTime, initialFlexibility, initialSeats]);


  // Generate next 7 days
  const days = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      const dayNum = d.getDate();
      const fullDateStr = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      list.push({ offset: i, dayName, dayNum, fullDateStr, date: d });
    }
    return list;
  }, []);

  const activeDay = days[selectedDateOffset] || days[0];

  // Format display time
  const displayTime = useMemo(() => {
    const [h, m] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(h || 8);
    date.setMinutes(m || 30);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, [timeString]);

  if (!isOpen) return null;

  const handleFindRides = () => {
    const [h, m] = timeString.split(":").map(Number);
    const finalDate = new Date(activeDay.date);
    finalDate.setHours(h || 8);
    finalDate.setMinutes(m || 30);
    finalDate.setSeconds(0);
    finalDate.setMilliseconds(0);

    onConfirm({
      dateTime: finalDate,
      flexibilityMinutes: flexibility,
      seats: seatCount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-t-sheet sm:rounded-dialog bg-surface shadow-premium border border-border overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-border-secondary/60"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Date & Time
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-subtle text-foreground-secondary hover:text-foreground transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 pt-2 space-y-5">
          {/* Select Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-2.5">
              Select Date
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {days.map((d) => {
                const isSelected = selectedDateOffset === d.offset;
                return (
                  <button
                    key={d.offset}
                    type="button"
                    onClick={() => setSelectedDateOffset(d.offset)}
                    className={`flex flex-col items-center justify-center min-w-[62px] py-3 px-2 rounded-2xl border transition ${
                      isSelected
                        ? "border-primary bg-primary text-white shadow-medium scale-105"
                        : "border-border bg-surface-subtle text-foreground hover:border-border-secondary hover:bg-surface"
                    }`}
                  >
                    <span className={`text-[11px] font-semibold ${isSelected ? "text-primary-subtle" : "text-foreground-secondary"}`}>
                      {d.dayName}
                    </span>
                    <span className="text-lg font-bold mt-0.5">{d.dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-2">
              Time
            </label>
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-surface-subtle">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                {isEditingTime ? (
                  <input
                    type="time"
                    value={timeString}
                    onChange={(e) => setTimeString(e.target.value)}
                    className="rounded-lg border border-primary bg-surface px-2 py-1 text-base font-bold text-foreground focus:outline-none"
                    autoFocus
                    onBlur={() => setIsEditingTime(false)}
                  />
                ) : (
                  <div className="text-xl font-bold tracking-tight text-foreground">
                    {displayTime}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsEditingTime(!isEditingTime)}
                className="rounded-xl bg-primary-subtle/80 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-subtle transition"
              >
                {isEditingTime ? "Done" : "Edit"}
              </button>
            </div>
          </div>

          {/* Flexibility & Seats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-2">
                Flexibility
              </label>
              <div className="flex items-center rounded-xl border border-border bg-surface-subtle p-1">
                {[
                  { label: "Exact", val: 0 },
                  { label: "±15m", val: 15 },
                  { label: "±30m", val: 30 },
                ].map((f) => {
                  const isSelected = flexibility === f.val;
                  return (
                    <button
                      key={f.val}
                      type="button"
                      onClick={() => setFlexibility(f.val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isSelected
                          ? "bg-primary text-white shadow-soft"
                          : "text-foreground-secondary hover:text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-2">
                Seats
              </label>
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle p-1 px-2">
                <button
                  type="button"
                  onClick={() => setSeatCount((c) => Math.max(1, c - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-foreground hover:bg-surface-elevated transition shadow-soft disabled:opacity-40"
                  disabled={seatCount <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-base font-bold text-foreground">
                  {seatCount}
                </span>
                <button
                  type="button"
                  onClick={() => setSeatCount((c) => Math.min(6, c + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-foreground hover:bg-surface-elevated transition shadow-soft disabled:opacity-40"
                  disabled={seatCount >= 6}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Summary Preview Box */}
          <div className="rounded-2xl border border-primary-subtle bg-secondary-subtle/50 p-4 space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-foreground-secondary">From</span>
                <div className="font-semibold text-foreground truncate mt-0.5">
                  {pickupLabel || "Pickup Point"}
                </div>
              </div>
              <div>
                <span className="text-foreground-secondary">To</span>
                <div className="font-semibold text-foreground truncate mt-0.5">
                  {destinationLabel || "College Campus"}
                </div>
              </div>
            </div>
            <div className="border-t border-primary-subtle/50 pt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-foreground-secondary">Date</span>
                <div className="font-semibold text-foreground mt-0.5">
                  {activeDay.fullDateStr}
                </div>
              </div>
              <div>
                <span className="text-foreground-secondary">Time</span>
                <div className="font-semibold text-foreground mt-0.5">
                  {displayTime} {flexibility > 0 ? `±${flexibility}m` : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-surface">
          <button
            type="button"
            onClick={handleFindRides}
            className="flex w-full items-center justify-center gap-2 rounded-button bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99]"
          >
            <span>Find Rides</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
