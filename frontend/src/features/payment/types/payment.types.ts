export type UUID = string;
export type LocalDateTime = string;

export type PaymentProvider = "RAZORPAY" | "PAYPAL" | "STRIPE" | "OTHER";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface CreatePaymentRequest {
  amount: string; // BigDecimal
  provider: PaymentProvider;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  id: UUID;
  userId: UUID;
  amount: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  providerPaymentId?: string;
  createdAt: LocalDateTime;
  updatedAt?: LocalDateTime;
}
