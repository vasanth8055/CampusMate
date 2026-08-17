import api from "@/services/api/axios";

import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
} from "../types/auth.types";

export const login = async (payload: LoginRequest) => {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/api/v1/auth/login", payload);
  return data;
};

export const register = async (payload: RegisterRequest) => {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/api/v1/auth/register", payload);
  return data;
};

export const logout = async () => {
  const { data } = await api.post<ApiResponse<void>>("/api/v1/auth/logout");
  return data;
};

export const forgotPassword = async (payload: ForgotPasswordRequest) => {
  const { data } = await api.post<ApiResponse<void>>("/api/v1/auth/forgot-password", payload);
  return data;
};

export const resetPassword = async (payload: ResetPasswordRequest) => {
  const { data } = await api.post<ApiResponse<void>>("/api/v1/auth/reset-password", payload);
  return data;
};

export const refreshToken = async (payload: RefreshTokenRequest) => {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/api/v1/auth/refresh-token", payload);
  return data;
};

export const sendOtp = async (payload: SendOtpRequest) => {
  const { data } = await api.post<ApiResponse<void>>("/api/v1/auth/send-otp", payload);
  return data;
};

export const verifyOtp = async (payload: VerifyOtpRequest) => {
  const { data } = await api.post<ApiResponse<void>>("/api/v1/auth/verify-otp", payload);
  return data;
};

export const resendOtp = async (payload: ResendOtpRequest) => {
  const { data } = await api.post<ApiResponse<void>>("/api/v1/auth/resend-otp", payload);
  return data;
};
