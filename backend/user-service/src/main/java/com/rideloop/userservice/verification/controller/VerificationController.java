package com.rideloop.userservice.verification.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.userservice.user.service.interfaces.UserService;
import com.rideloop.userservice.verification.dto.request.ResendOtpRequest;
import com.rideloop.userservice.verification.dto.request.SendOtpRequest;
import com.rideloop.userservice.verification.dto.request.VerifyOtpRequest;
import com.rideloop.userservice.verification.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rideloop.userservice.verification.service.VerificationService;
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;
    private final UserService userService;
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {

        verificationService.sendOtp(request.getEmail());

        return ResponseEntity.ok(
                ApiResponse.success(
                        "OTP sent successfully",
                        null
                )
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        userService.verifyEmail(
                request.getEmail(),
                request.getOtp()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "OTP verified successfully",
                        null
                )
        );
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {

        verificationService.resendOtp(
                request.getEmail()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "OTP resent successfully",
                        null
                )
        );
    }
}