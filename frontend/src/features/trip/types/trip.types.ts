export type UUID = string;

export type BigDecimal = string;

export type LocalDateTime = string;

export type TripStatus =
  | "SCHEDULED"
  | "FULL"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type VehicleType =
  | "BIKE"
  | "SCOOTER"
  | "AUTO"
  | "CAR";

export type VehicleStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface DriverInfoResponse {
  driverId: UUID;
  userId: UUID;
  firstName: string;
  lastName: string;
  email: string;
}

export interface VehicleResponse {
  vehicleId: UUID;
  driverId: UUID;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  color: string;
  registrationNumber: string;
  maxPassengerCapacity: number;
  rcImageUrl?: string | null;
  status: VehicleStatus;
}

export interface TripResponse {
  id: UUID;
  driverId: UUID;

  source: string;
  sourceLatitude?: number | null;
  sourceLongitude?: number | null;

  destination: string;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;

  departureTime: LocalDateTime;
  arrivalTime: LocalDateTime;

  availableSeats: number;
  price: BigDecimal;

  status: TripStatus;

  createdAt: LocalDateTime;
  updatedAt: LocalDateTime;

  driver: DriverInfoResponse;
  vehicle: VehicleResponse;
}

export interface CreateTripRequest {
  source: string;
  sourceLatitude?: number | null;
  sourceLongitude?: number | null;
  destination: string;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  departureTime: LocalDateTime;
  arrivalTime: LocalDateTime;
  availableSeats: number;
  price: number | BigDecimal;
}

export interface UpdateTripRequest {
  source?: string;
  destination?: string;
  departureTime?: LocalDateTime;
  arrivalTime?: LocalDateTime;
  availableSeats?: number;
  price?: BigDecimal;
  status?: TripStatus;
}