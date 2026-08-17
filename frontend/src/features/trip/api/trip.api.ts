import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";

import type {
  TripResponse,
  CreateTripRequest,
  UpdateTripRequest,
} from "../types/trip.types";

export const searchTrips = async (params: {
  source: string;
  destination: string;
  from: string;
  to: string;
  seats: number;
}) => {
  const { data } = await api.get<ApiResponse<TripResponse[]>>(
    "/api/v1/trips/search",
    { params }
  );

  return data;
};

export const getTrip = async (tripId: string) => {
  const { data } = await api.get<ApiResponse<TripResponse>>(
    `/api/v1/trips/${tripId}`
  );

  return data;
};

export const createTrip = async (payload: CreateTripRequest) => {
  const { data } = await api.post<ApiResponse<TripResponse>>(
    "/api/v1/trips",
    payload
  );

  return data;
};

export const updateTrip = async (
  tripId: string,
  payload: UpdateTripRequest
) => {
  const { data } = await api.put<ApiResponse<TripResponse>>(
    `/api/v1/trips/${tripId}`,
    payload
  );

  return data;
};

export const deleteTrip = async (tripId: string) => {
  const { data } = await api.delete<ApiResponse<void>>(
    `/api/v1/trips/${tripId}`
  );

  return data;
};

export const getAllTrips = async () => {
  const { data } = await api.get<ApiResponse<TripResponse[]>>(
    "/api/v1/trips"
  );

  return data;
};

export const getMyTrips = async () => {
  const { data } = await api.get<ApiResponse<TripResponse[]>>(
    "/api/v1/trips/me"
  );

  return data;
};

export const startTrip = async (tripId: string) => {
  const { data } = await api.post<ApiResponse<TripResponse>>(
    `/api/v1/trips/${tripId}/start`
  );

  return data;
};

export const completeTrip = async (tripId: string) => {
  const { data } = await api.post<ApiResponse<TripResponse>>(
    `/api/v1/trips/${tripId}/complete`
  );

  return data;
};

export const cancelTrip = async (tripId: string) => {
  const { data } = await api.post<ApiResponse<TripResponse>>(
    `/api/v1/trips/${tripId}/cancel`
  );

  return data;
};