import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  accessToken: string;
  refreshToken?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export const adminLogin = async (payload: AdminLoginRequest) => {
  // Note: gateway routes /admin-service/** to ADMIN-SERVICE and strips the prefix
  const { data } = await api.post<ApiResponse<AdminAuthResponse>>("/admin-service/api/v1/auth/login", payload);
  return data;
};

export const getAdminProfile = async () => {
  const { data } = await api.get<ApiResponse<AdminAuthResponse>>("/admin-service/api/v1/auth/profile");
  return data;
};
