import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type {
  AdminDashboardResponse,
  AdminUser,
  AdminDriver,
  AdminVehicle,
  AdminTrip,
  AdminBooking,
  SystemHealthResponse,
} from "@/features/admin/types/admin.types";

// ==========================================
// Dashboard
// ==========================================

export const getAdminDashboard = async () => {
  const { data } = await api.get<ApiResponse<AdminDashboardResponse>>(
    "/api/v1/admin/dashboard"
  );
  return data;
};

// ==========================================
// Users
// ==========================================

export const getAdminUsers = async () => {
  const { data } = await api.get<ApiResponse<AdminUser[]>>(
    "/api/v1/admin/users"
  );
  return data;
};

export const getAdminUser = async (userId: string) => {
  const { data } = await api.get<ApiResponse<AdminUser>>(
    `/api/v1/admin/users/${userId}`
  );
  return data;
};

export const blockAdminUser = async (userId: string) => {
  const { data } = await api.patch<ApiResponse<void>>(
    `/api/v1/admin/users/${userId}/block`
  );
  return data;
};

export const unblockAdminUser = async (userId: string) => {
  const { data } = await api.patch<ApiResponse<void>>(
    `/api/v1/admin/users/${userId}/unblock`
  );
  return data;
};

export const resetAdminUserPassword = async (
  userId: string,
  newPassword?: string
) => {
  const url = newPassword
    ? `/api/v1/admin/users/${userId}/reset-password?newPassword=${encodeURIComponent(
        newPassword
      )}`
    : `/api/v1/admin/users/${userId}/reset-password`;
  const { data } = await api.post<ApiResponse<void>>(url);
  return data;
};

// ==========================================
// Drivers & Applications
// ==========================================

export const getAdminDrivers = async (status?: string) => {
  const url = status
    ? `/api/v1/admin/drivers?status=${encodeURIComponent(status)}`
    : "/api/v1/admin/drivers";
  const { data } = await api.get<ApiResponse<AdminDriver[]>>(url);
  return data;
};

export const getPendingDrivers = async () => {
  const { data } = await api.get<ApiResponse<AdminDriver[]>>(
    "/api/v1/admin/drivers/pending"
  );
  return data;
};

export const getAdminDriver = async (driverId: string) => {
  const { data } = await api.get<ApiResponse<AdminDriver>>(
    `/api/v1/admin/drivers/${driverId}`
  );
  return data;
};

export const approveAdminDriver = async (driverId: string) => {
  const { data } = await api.patch<ApiResponse<void>>(
    `/api/v1/admin/drivers/${driverId}/approve`
  );
  return data;
};

export const rejectAdminDriver = async (
  driverId: string,
  reason?: string
) => {
  const url = reason
    ? `/api/v1/admin/drivers/${driverId}/reject?reason=${encodeURIComponent(
        reason
      )}`
    : `/api/v1/admin/drivers/${driverId}/reject`;
  const { data } = await api.patch<ApiResponse<void>>(url);
  return data;
};

export const suspendAdminDriver = async (
  driverId: string,
  reason?: string
) => {
  const url = reason
    ? `/api/v1/admin/drivers/${driverId}/suspend?reason=${encodeURIComponent(
        reason
      )}`
    : `/api/v1/admin/drivers/${driverId}/suspend`;
  const { data } = await api.patch<ApiResponse<void>>(url);
  return data;
};

export const restoreAdminDriver = async (driverId: string) => {
  const { data } = await api.patch<ApiResponse<void>>(
    `/api/v1/admin/drivers/${driverId}/restore`
  );
  return data;
};

// ==========================================
// Vehicles
// ==========================================

export const getAdminVehicles = async () => {
  const { data } = await api.get<ApiResponse<AdminVehicle[]>>(
    "/api/v1/admin/vehicles"
  );
  return data;
};

export const getAdminVehicle = async (vehicleId: string) => {
  const { data } = await api.get<ApiResponse<AdminVehicle>>(
    `/api/v1/admin/vehicles/${vehicleId}`
  );
  return data;
};

export const approveAdminVehicle = async (vehicleId: string) => {
  const { data } = await api.patch<ApiResponse<void>>(
    `/api/v1/admin/vehicles/${vehicleId}/approve`
  );
  return data;
};

export const deactivateAdminVehicle = async (vehicleId: string) => {
  const { data } = await api.patch<ApiResponse<void>>(
    `/api/v1/admin/vehicles/${vehicleId}/deactivate`
  );
  return data;
};

export const reactivateAdminVehicle = async (vehicleId: string) => {
  const { data } = await api.patch<ApiResponse<void>>(
    `/api/v1/admin/vehicles/${vehicleId}/reactivate`
  );
  return data;
};

// ==========================================
// Trips
// ==========================================

export const getAdminTrips = async (status?: string, driverId?: string) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (driverId) params.append("driverId", driverId);
  const query = params.toString() ? `?${params.toString()}` : "";
  const { data } = await api.get<ApiResponse<AdminTrip[]>>(
    `/api/v1/admin/trips${query}`
  );
  return data;
};

export const getAdminActiveTrips = async () => {
  const { data } = await api.get<ApiResponse<AdminTrip[]>>(
    "/api/v1/admin/trips/active"
  );
  return data;
};

export const getAdminTripDetails = async (tripId: string) => {
  const { data } = await api.get<ApiResponse<AdminTrip>>(
    `/api/v1/admin/trips/${tripId}`
  );
  return data;
};

export const cancelAdminTrip = async (tripId: string, driverId?: string) => {
  const url = driverId
    ? `/api/v1/admin/trips/${tripId}/cancel?driverId=${encodeURIComponent(
        driverId
      )}`
    : `/api/v1/admin/trips/${tripId}/cancel`;
  const { data } = await api.patch<ApiResponse<AdminTrip>>(url);
  return data;
};

// ==========================================
// Bookings
// ==========================================

export const getAdminBookings = async () => {
  const { data } = await api.get<ApiResponse<AdminBooking[]>>(
    "/api/v1/admin/bookings"
  );
  return data;
};

export const getAdminBookingDetails = async (bookingId: string) => {
  const { data } = await api.get<ApiResponse<AdminBooking>>(
    `/api/v1/admin/bookings/${bookingId}`
  );
  return data;
};

// ==========================================
// System Health
// ==========================================

export const getAdminSystemHealth = async () => {
  const { data } = await api.get<ApiResponse<SystemHealthResponse>>(
    "/api/v1/admin/health"
  );
  return data;
};

// ==========================================
// Reports Export URL
// ==========================================

export const getExportReportUrl = (
  type: "users" | "drivers" | "trips" | "bookings"
) => {
  return `/api/v1/admin/reports/export/${type}`;
};

// ==========================================
// Settings & Auth
// ==========================================

export const changeAdminPassword = async (payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const { data } = await api.post<ApiResponse<void>>(
    "/admin-service/api/v1/auth/change-password",
    payload
  );
  return data;
};

