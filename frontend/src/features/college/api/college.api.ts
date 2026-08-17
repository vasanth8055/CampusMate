import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { CollegeResponse } from "../types/college.types";

export const getColleges = async () => {
  const { data } = await api.get<ApiResponse<CollegeResponse[]>>("/api/v1/colleges");
  return data;
};

export const sendCollegeVerificationOtp = async (payload: {
  collegeId: string;
  collegeEmail: string;
}) => {
  const { data } = await api.post<ApiResponse<void>>(
    "/api/v1/colleges/send-verification-otp",
    payload
  );
  return data;
};

export const verifyCollegeOtp = async (payload: {
  collegeEmail: string;
  otp: string;
}) => {
  const { data } = await api.post<ApiResponse<void>>(
    "/api/v1/colleges/verify-otp",
    payload
  );
  return data;
};
