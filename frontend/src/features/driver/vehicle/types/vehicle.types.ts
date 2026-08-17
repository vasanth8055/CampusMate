export type UUID = string;

export type VehicleType =
  | "BIKE"
  | "SCOOTER"
  | "AUTO"
  | "CAR";

export type VehicleStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface VehicleResponse {
  vehicleId: UUID;
  driverId: UUID;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  color: string;
  registrationNumber: string;
  maxPassengerCapacity: number;
  rcImageUrl?: string;
  status: VehicleStatus;
}

export interface CreateVehicleRequest {
  vehicleType: VehicleType;
  brand: string;
  model: string;
  color: string;
  registrationNumber: string;
  maxPassengerCapacity: number;
}

export interface UpdateVehicleRequest {
  vehicleType: VehicleType;
  brand: string;
  model: string;
  color: string;
  registrationNumber: string;
  maxPassengerCapacity: number;
}