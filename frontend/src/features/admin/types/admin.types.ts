export interface AdminDashboardResponse {
  totalUsers: number;
  verifiedStudents: number;
  totalDrivers: number;
  approvedDrivers: number;
  pendingDrivers: number;
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApplications: AdminDriver[];
  activeRides: AdminTrip[];
  recentActivity: AdminActivityItem[];
}

export interface AdminActivityItem {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  emailVerified: boolean;
  collegeVerified: boolean;
  collegeName?: string;
  collegeEmail?: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminVehicle {
  id: string;
  vehicleId?: string;
  driverId: string;
  vehicleType: "CAR" | "BIKE" | "SCOOTER" | "AUTO" | string;
  brand: string;
  model: string;
  color?: string;
  registrationNumber: string;
  maxPassengerCapacity: number;
  rcImageUrl?: string;
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt?: string;
}

export interface AdminDriver {
  driverId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  collegeName?: string;
  collegeVerified: boolean;
  drivingLicenseNumber: string;
  licenseImageUrl?: string;
  status: "PENDING" | "LICENSE_UPLOADED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";
  rejectionReason?: string;
  vehicle?: AdminVehicle;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminTrip {
  id: string;
  driverId: string;
  vehicleId?: string;
  source: string;
  destination: string;
  sourceLatitude?: number;
  sourceLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  departureTime: string;
  estimatedArrivalTime?: string;
  availableSeats: number;
  totalSeats: number;
  farePerSeat: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  driverName?: string;
  driverPhone?: string;
  vehicleModel?: string;
  vehicleRegistrationNumber?: string;
  createdAt?: string;
}

export interface AdminBooking {
  id?: string;
  bookingId?: string;
  tripId?: string;
  riderId?: string;
  driverId?: string;
  requestedSeats?: number;
  seatsBooked?: number;
  totalFare?: number;
  status?: "REQUESTED" | "ACCEPTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED" | string;
  pickupLocation?: string;
  dropLocation?: string;
  paymentStatus?: string;
  riderName?: string;
  driverName?: string;
  bookingTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemHealthServiceItem {
  serviceId: string;
  serviceName: string;
  description: string;
  status: "OPERATIONAL" | "DEGRADED" | "DOWN";
  responseTimeMs: number;
  lastCheck: string;
}

export interface SystemHealthResponse {
  uptimePercent: number;
  globalStatus: string;
  avgLatencyMs: number;
  activeAlertsCount: number;
  services: SystemHealthServiceItem[];
}

export type DashboardResponse = AdminDashboardResponse;
