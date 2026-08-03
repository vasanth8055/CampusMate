package com.rideloop.userservice.auth.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.userservice.auth.dto.request.LoginRequest;
import com.rideloop.userservice.auth.dto.request.RegisterRequest;
import com.rideloop.userservice.auth.dto.response.AuthResponse;
import com.rideloop.userservice.user.service.interfaces.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rideloop.userservice.auth.dto.request.ForgotPasswordRequest;
import com.rideloop.userservice.auth.dto.request.ResetPasswordRequest;
import com.rideloop.userservice.auth.dto.request.RefreshTokenRequest;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(
        name = "Authentication APIs",
        description = "User registration, login and logout APIs"
)
public class AuthController {

    private final UserService userService;

    @Operation(
            summary = "Register User",
            description = "Registers a new user and sends an email verification OTP."
    )
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        System.out.println("REGISTER API HIT");

        AuthResponse response = userService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registration successful. Please verify your email using the OTP sent to your email.",
                                response
                        )
                );
    }

    @Operation(
            summary = "Login User",
            description = "Authenticates the user and returns a JWT token."
    )
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = userService.login(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Login successful.",
                        response
                )
        );
    }

    @Operation(
            summary = "Logout User",
            description = "Logs out the currently authenticated user."
    )
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {

        return ResponseEntity.ok(
                userService.logout()
        );
    }
    @Operation(
            summary = "Forgot Password",
            description = "Sends a password reset OTP to the registered email."
    )
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        userService.forgotPassword(request.getEmail());

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password reset OTP sent successfully.",
                        null
                )
        );
    }

    @Operation(
            summary = "Reset Password",
            description = "Verifies the OTP and resets the user's password."
    )
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        userService.resetPassword(
                request.getEmail(),
                request.getOtp(),
                request.getNewPassword()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password reset successful.",
                        null
                )
        );
    }
    @Operation(
            summary = "Refresh Access Token",
            description = "Generates a new access token using a valid refresh token."
    )
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        AuthResponse response =
                userService.refreshToken(
                        request.getRefreshToken()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Token refreshed successfully.",
                        response
                )
        );
    }

}