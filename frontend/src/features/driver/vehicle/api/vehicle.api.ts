import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type {
  VehicleResponse,
  CreateVehicleRequest,
  UpdateVehicleRequest,
} from "../types/vehicle.types";

export const getMyVehicle = async () => {
  const { data } = await api.get<ApiResponse<VehicleResponse>>(
    "/api/v1/driver/vehicle/me"
  );
  return data;
};

export const getAllVehicles = async () => {
  const { data } = await api.get<ApiResponse<VehicleResponse[]>>(
    "/api/v1/driver/vehicle/all"
  );
  return data;
};

export const activateVehicle = async (vehicleId: string) => {
  const { data } = await api.put<ApiResponse<VehicleResponse>>(
    `/api/v1/driver/vehicle/${vehicleId}/activate`
  );
  return data;
};

export const registerVehicle = async (payload: CreateVehicleRequest) => {
  const { data } = await api.post<ApiResponse<VehicleResponse>>(
    "/api/v1/driver/vehicle",
    payload
  );
  return data;
};

export const updateVehicle = async (payload: UpdateVehicleRequest) => {
  const { data } = await api.put<ApiResponse<VehicleResponse>>(
    "/api/v1/driver/vehicle",
    payload
  );
  return data;
};

export const uploadRcImage = async (file: File) => {
  const form = new FormData();
  form.append("file", file);

  const { data } = await api.post<ApiResponse<void>>(
    "/api/v1/driver/vehicle/rc",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

export const deleteVehicle = async () => {
  const { data } = await api.delete<ApiResponse<void>>("/api/v1/driver/vehicle");
  return data;
};