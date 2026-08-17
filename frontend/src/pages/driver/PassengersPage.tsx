import { useQuery } from "@tanstack/react-query";
import { getTripBookingsWithDetails } from "@/features/booking/api/booking.api";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useParams, useNavigate } from "react-router-dom";
import { Users, ArrowLeft } from "lucide-react";

export default function PassengersPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["trips", tripId, "bookings"],
    queryFn: () => (tripId ? getTripBookingsWithDetails(tripId) : Promise.resolve([])),
    enabled: Boolean(tripId),
    refetchInterval: 5000,
  });

  const bookings = data ?? [];

  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate(`/driver/trips/${tripId}`))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <PageHeader title="Trip Passengers" subtitle="Verified riders booked on this commute" />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-foreground-secondary">
            Loading passengers...
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center space-y-2">
            <Users className="h-8 w-8 text-foreground-muted mx-auto" />
            <div className="font-bold text-sm text-foreground">No passengers booked yet</div>
            <p className="text-xs text-foreground-secondary">
              Confirmed riders for this trip will appear here.
            </p>
          </div>
        ) : (
          bookings.map(({ booking: b, rider: r }: any) => {
            const riderName = r
              ? `${r.firstName || ""} ${r.lastName || ""}`.trim() || "Student Passenger"
              : "Student Passenger";

            return (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-xs">
                    {riderName[0] || "P"}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-foreground">{riderName}</div>
                    <div className="text-[11px] text-foreground-secondary">
                      {b.requestedSeats} Seat{b.requestedSeats > 1 ? "s" : ""} Booked • {r?.email || "Student"}
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-primary-subtle text-primary px-2.5 py-1 text-xs font-bold">
                  {b.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </PageContainer>
  );
}
