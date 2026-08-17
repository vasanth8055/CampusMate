import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { DriverResponse } from "../types/driver.types";

export const becomeDriver = async (payload: { drivingLicenseNumber: string }) => {
  const { data } = await api.post<ApiResponse<DriverResponse>>(`/api/v1/drivers/become-driver`, payload);
  return data;
};

export const uploadLicense = async (file: File) => {
  const form = new FormData();
  form.append("file", file);

  const { data } = await api.post<ApiResponse<void>>(`/api/v1/drivers/upload-license`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

export const getDriver = async (driverId: string) => {
  const { data } = await api.get<ApiResponse<DriverResponse>>(`/api/v1/drivers/${driverId}`);
  return data;
};

export const getMyDriver = async () => {
  const { data } = await api.get<ApiResponse<DriverResponse>>(`/api/v1/drivers/me`);
  return data;
};

export const isDriverApproved = async (driverId: string) => {
  const { data } = await api.get<ApiResponse<boolean>>(`/api/v1/internal/drivers/${driverId}/approved`);
  return data;
};
