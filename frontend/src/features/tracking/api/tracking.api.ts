import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { RideLocationResponse, LocationUpdateRequest } from "../types/tracking.types";

export const getLatestLocation = async (tripId: string) => {
  const { data } = await api.get<ApiResponse<RideLocationResponse>>(
    `/api/v1/tracking/${tripId}/latest`
  );
  return data;
};

export const getRideHistory = async (tripId: string) => {
  const { data } = await api.get<ApiResponse<RideLocationResponse[]>>(
    `/api/v1/tracking/${tripId}/history`
  );
  return data;
};

export const updateLocation = async (
  tripId: string,
  payload: LocationUpdateRequest
) => {
  const { data } = await api.post<ApiResponse<RideLocationResponse>>(
    `/api/v1/tracking/${tripId}/location`,
    payload
  );
  return data;
};
