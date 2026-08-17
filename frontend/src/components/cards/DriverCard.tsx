import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type DriverCardProps = {
  id?: string | number;
  name: string;
  avatarUrl?: string;
  verified?: boolean;
  rating?: number; // 0-5
  totalTrips?: number;
  vehicleName?: string;
  vehicleNumber?: string;
  seatsAvailable?: number;
  genderPreference?: "any" | "female_only" | "male_only";
  college?: string;
  languages?: string[];
  responseRate?: string; // e.g. "98%"
  onBook?: () => void;
  onViewProfile?: () => void;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
};

export function DriverCard({
  id,
  name,
  avatarUrl,
  verified = false,
  rating,
  totalTrips,
  vehicleName,
  vehicleNumber,
  seatsAvailable,
  genderPreference,
  college,
  languages,
  responseRate,
  onBook,
  onViewProfile,
  loading = false,
  className,
  children,
}: DriverCardProps) {
  const ratingText = rating !== undefined ? `${rating.toFixed(1)} ★` : "-";

  return (
    <Card loading={loading} className={cn("w-full", className)} aria-labelledby={id ? `driver-${id}-name` : undefined}>
      <CardContent>
        <div className="flex items-start gap-3">
          <Avatar name={name} src={avatarUrl} size="md" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle id={id ? `driver-${id}-name` : undefined} className="truncate">{name}</CardTitle>
              {verified ? <Badge variant="verified" size="sm">Verified</Badge> : null}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-small text-foreground-secondary">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-accent" aria-hidden="true" />
                <span className="font-medium text-foreground">{ratingText}</span>
              </span>

              {typeof totalTrips === "number" ? (
                <span className="text-foreground-secondary">{totalTrips} trips</span>
              ) : null}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-small">
              <div className="flex flex-col">
                <span className="text-foreground-secondary">Vehicle</span>
                <span className="font-medium text-foreground">{vehicleName ?? "-"}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-foreground-secondary">Reg. No.</span>
                <span className="font-medium text-foreground">{vehicleNumber ?? "-"}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-foreground-secondary">Seats</span>
                <span className="font-medium text-foreground">{seatsAvailable ?? "-"}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-foreground-secondary">College</span>
                <span className="font-medium text-foreground truncate">{college ?? "-"}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-small text-foreground-secondary">
              {genderPreference ? (
                <Badge variant="default" size="sm">{genderPreference === "any" ? "Any" : genderPreference === "female_only" ? "Female" : "Male"}</Badge>
              ) : null}

              {languages && languages.length > 0 ? (
                <span className="text-foreground">{languages.join(", ")}</span>
              ) : null}

              {responseRate ? (
                <span className="ml-auto text-small text-foreground-secondary">Response: <span className="font-medium text-foreground">{responseRate}</span></span>
              ) : null}
            </div>

            {children}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-center gap-3">
          <Button variant="ghost" size="md" onClick={onViewProfile} aria-label={`View profile of ${name}`}>
            View Profile
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="primary" onClick={onBook} aria-label={`Book ride with ${name}`}>
              Book Ride
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default DriverCard;
