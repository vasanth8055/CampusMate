export type UUID = string;
export type LocalDateTime = string;

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "REJECTED"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export interface BookingResponse {
  id: UUID;
  tripId: UUID;
  riderId: UUID;
  driverId: UUID;
  requestedSeats: number;
  status: BookingStatus;
  bookingTime?: LocalDateTime;
  acceptedAt?: LocalDateTime;
  rejectedAt?: LocalDateTime;
  cancelledAt?: LocalDateTime;
  confirmedAt?: LocalDateTime;
  startedAt?: LocalDateTime;
  completedAt?: LocalDateTime;
  createdAt?: LocalDateTime;
  updatedAt?: LocalDateTime;
}

export interface CreateBookingRequest {
  tripId: UUID;
  requestedSeats: number;
}

export interface EnrichedDriverBooking {
  booking: BookingResponse;
  trip?: import("@/features/trip/types/trip.types").TripResponse;
  rider?: import("@/features/profile/types/profile.types").UserResponse;
}

