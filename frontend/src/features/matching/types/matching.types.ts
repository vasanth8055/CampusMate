export type UUID = string;
export type LocalDateTime = string;

export interface MatchRequest {
  source: string;
  sourceLatitude?: number | null;
  sourceLongitude?: number | null;
  destination: string;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  preferredDepartureTime: LocalDateTime;
  requiredSeats: number;
  timeToleranceMinutes: number;
}

export interface MatchResponse {
  tripId: UUID;
  driverId: UUID;
  source: string;
  destination: string;
  departureTime: LocalDateTime;
  arrivalTime: LocalDateTime;
  availableSeats: number;
  price: string; // BigDecimal -> string
  departureDifferenceMinutes: number;
  matchScore: number;
  scoreBreakdown?: Record<string, any>;
}
