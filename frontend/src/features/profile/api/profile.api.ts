import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { UserResponse, UpdateUserRequest } from "../types/profile.types";

export const getCurrentUser = async () => {
  const { data } = await api.get<ApiResponse<UserResponse>>("/api/v1/users/me");
  return data;
};

export const updateCurrentUser = async (payload: UpdateUserRequest) => {
  const { data } = await api.put<ApiResponse<UserResponse>>("/api/v1/users/me", payload);
  return data;
};

export const deleteCurrentUser = async () => {
  const { data } = await api.delete<ApiResponse<void>>("/api/v1/users/me");
  return data;
};

export const changePassword = async (payload: any) => {
  const { data } = await api.put<ApiResponse<void>>("/api/v1/users/change-password", payload);
  return data;
};

export const getUserById = async (userId: string) => {
  const { data } = await api.get<UserResponse>(`/api/v1/users/${userId}`);
  return data;
};


