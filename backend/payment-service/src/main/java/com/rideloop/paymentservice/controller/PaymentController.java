package com.rideloop.paymentservice.controller;

import com.rideloop.paymentservice.dto.request.CreatePaymentRequest;
import com.rideloop.paymentservice.dto.response.PaymentResponse;
import com.rideloop.paymentservice.service.interfaces.PaymentService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.sharedkernel.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreatePaymentRequest request) {

        PaymentResponse response =
                paymentService.createPayment(
                        user.getUserId(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Payment created successfully",
                                response
                        )
                );
    }

    @PostMapping("/{paymentId}/process")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @PathVariable UUID paymentId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payment processed successfully",
                        paymentService.processPayment(
                                paymentId,
                                user.getUserId()
                        )
                )
        );
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(
            @PathVariable UUID paymentId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payment fetched successfully",
                        paymentService.getPayment(
                                paymentId,
                                user.getUserId()
                        )
                )
        );
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMyPayments(
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payments fetched successfully",
                        paymentService.getMyPayments(
                                user.getUserId()
                        )
                )
        );
    }
}