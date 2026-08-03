package com.rideloop.paymentservice.dto.response;

import com.rideloop.paymentservice.entity.enums.PaymentProvider;
import com.rideloop.paymentservice.entity.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResponse(

        UUID id,
        UUID bookingId,
        UUID riderId,
        UUID driverId,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        PaymentProvider provider,
        String providerPaymentId,
        String failureReason,
        LocalDateTime paidAt,
        LocalDateTime failedAt,
        LocalDateTime refundedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}