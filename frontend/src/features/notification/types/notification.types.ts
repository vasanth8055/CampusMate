export type UUID = string;
export type LocalDateTime = string;

export type NotificationType =
  | "BOOKING_REQUESTED"
  | "BOOKING_ACCEPTED"
  | "BOOKING_REJECTED"
  | "BOOKING_CANCELLED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_STARTED"
  | "BOOKING_COMPLETED"
  | "PAYMENT_SUCCESS"
  | "RIDE_STARTED"
  | "RIDE_COMPLETED"
  | "RIDE_CANCELLED";

export interface NotificationResponse {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: UUID;
  tripId?: UUID;
  read: boolean;
  createdAt: LocalDateTime;
  readAt?: LocalDateTime;
}
