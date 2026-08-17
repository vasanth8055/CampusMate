import type { ReactNode } from "react";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "REJECTED"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED"
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "started"
  | "completed";

export type BookingCardProps = {
  id?: string | number;
  pickup: string;
  destination: string;
  rideTime: string; // human readable
  driverName?: string;
  driverAvatar?: string;
  fare?: string;
  status?: BookingStatus;
  onCancel?: () => void; // placeholder
  onView?: () => void;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
};

const statusToBadgeVariant: Record<BookingStatus, string> = {
  REQUESTED: "pending",
  ACCEPTED: "verified",
  REJECTED: "rejected",
  PAYMENT_PENDING: "pending",
  CONFIRMED: "verified",
  ONGOING: "default",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  pending: "pending",
  confirmed: "verified",
  rejected: "rejected",
  cancelled: "cancelled",
  started: "default",
  completed: "completed",
};

export function BookingCard({
  id,
  pickup,
  destination,
  rideTime,
  driverName,
  driverAvatar,
  fare,
  status = "pending",
  onCancel,
  onView,
  loading = false,
  className,
  children,
}: BookingCardProps) {
  const statusVariant = statusToBadgeVariant[status] ?? "default";

  const normalizedStatus = status ?? "pending";
  const humanStatus = normalizedStatus
    .toString()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());

  return (
    <Card loading={loading} className={cn("w-full", className)} aria-labelledby={id ? `booking-${id}-title` : undefined}>
      <CardContent>
        <div className="flex items-start gap-3">
          <Avatar name={driverName ?? "Driver"} src={driverAvatar} size="md" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle id={id ? `booking-${id}-title` : undefined} className="truncate">
                {pickup} → {destination}
              </CardTitle>

              <Badge variant={statusVariant as any} size="sm">{humanStatus}</Badge>
            </div>

            <CardDescription className="mt-1 text-small text-foreground-secondary">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
                {rideTime}
              </span>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
                {driverName ?? "Driver TBD"}
              </span>
            </CardDescription>
          </div>

          {fare ? <div className="shrink-0 text-h3 font-semibold text-foreground">{fare}</div> : null}
        </div>

        {children}
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-center gap-3">
          {onView ? (
            <Button variant="outline" onClick={onView} aria-label="View booking details">View</Button>
          ) : null}

          <div className="ml-auto flex items-center gap-2">
            {status === "pending" && onCancel ? (
              <Button variant="danger" onClick={onCancel} aria-label="Cancel booking">Cancel</Button>
            ) : null}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default BookingCard;
