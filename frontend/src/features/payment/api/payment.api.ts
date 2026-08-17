import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { CreatePaymentRequest, PaymentResponse } from "../types/payment.types";

export const createPayment = async (payload: CreatePaymentRequest) => {
  const { data } = await api.post<ApiResponse<PaymentResponse>>("/api/v1/payments", payload);
  return data;
};

export const processPayment = async (paymentId: string) => {
  const { data } = await api.post<ApiResponse<PaymentResponse>>(`/api/v1/payments/${paymentId}/process`);
  return data;
};

export const getPayment = async (paymentId: string) => {
  const { data } = await api.get<ApiResponse<PaymentResponse>>(`/api/v1/payments/${paymentId}`);
  return data;
};

export const getMyPayments = async () => {
  const { data } = await api.get<ApiResponse<PaymentResponse[]>>("/api/v1/payments/me");
  return data;
};
