import { ArrowRight, Clock, MapPin, Users } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardActions,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ClickableCard,
} from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export type RideCardProps = {
  origin: string;
  destination: string;
  departureTime: string;
  seatsAvailable: number;
  price?: string;
  driverName?: string;
  footer?: ReactNode;
  loading?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
};

export function RideCard({
  origin,
  destination,
  departureTime,
  seatsAvailable,
  price,
  driverName,
  footer,
  loading = false,
  interactive = false,
  onClick,
  className,
}: RideCardProps) {
  const content = (
    <>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate">
            {origin} → {destination}
          </CardTitle>
          {driverName ? (
            <CardDescription className="mt-1">with {driverName}</CardDescription>
          ) : null}
        </div>
        {price ? (
          <span className="shrink-0 text-h3 font-semibold text-primary">{price}</span>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex flex-wrap items-center gap-3 text-small text-foreground-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
            {departureTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
            Campus route
          </span>
        </div>

        <Badge variant="availableSeats" size="sm" icon={<Users className="h-3 w-3" />}>
          {seatsAvailable} seat{seatsAvailable === 1 ? "" : "s"} left
        </Badge>
      </CardContent>

      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </>
  );

  if (interactive || onClick) {
    return (
      <ClickableCard
        loading={loading}
        onClick={onClick}
        className={cn("overflow-hidden", className)}
      >
        {content}
        <CardActions className="absolute top-4 right-4">
          <ArrowRight className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
        </CardActions>
      </ClickableCard>
    );
  }

  return (
    <Card loading={loading} className={cn("overflow-hidden", className)}>
      {content}
    </Card>
  );
}
