import type { VehicleResponse } from "../vehicle/types/vehicle.types";

export type UUID = string;

export type LocalDateTime = string;

export type DriverStatus =
  | "PENDING"
  | "LICENSE_UPLOADED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface DriverResponse {
  driverId: UUID;
  userId: UUID;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  collegeName?: string;
  collegeVerified?: boolean;
  drivingLicenseNumber?: string;
  licenseImageUrl?: string;
  status: DriverStatus;
  rejectionReason?: string;
  vehicle?: VehicleResponse;
  createdAt?: LocalDateTime;
  updatedAt?: LocalDateTime;
}