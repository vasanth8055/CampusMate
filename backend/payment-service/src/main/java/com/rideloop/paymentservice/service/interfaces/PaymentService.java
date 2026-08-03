package com.rideloop.paymentservice.service.interfaces;

import com.rideloop.paymentservice.dto.request.CreatePaymentRequest;
import com.rideloop.paymentservice.dto.response.PaymentResponse;

import java.util.List;
import java.util.UUID;

public interface PaymentService {

    PaymentResponse createPayment(
            UUID riderId,
            CreatePaymentRequest request
    );

    PaymentResponse processPayment(
            UUID paymentId,
            UUID riderId
    );

    PaymentResponse getPayment(
            UUID paymentId,
            UUID riderId
    );

    List<PaymentResponse> getMyPayments(
            UUID riderId
    );
}