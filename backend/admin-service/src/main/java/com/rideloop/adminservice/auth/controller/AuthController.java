package com.rideloop.adminservice.auth.controller;

import com.rideloop.adminservice.auth.dto.request.ChangePasswordRequest;
import com.rideloop.adminservice.auth.dto.request.LoginRequest;
import com.rideloop.adminservice.auth.dto.response.AuthResponse;
import com.rideloop.adminservice.auth.service.interfaces.AuthService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/admin/auth", "/api/v1/auth", "/api/v1/admin"})
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Login successful.",
                        authService.login(request)
                )
        );
    }

    @GetMapping({"/profile", "/me", "/current-admin"})
    public ResponseEntity<ApiResponse<AuthResponse>> profile(
            Authentication authentication) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile fetched successfully.",
                        authService.getProfile(
                                authentication.getName()
                        )
                )
        );
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        authService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password changed successfully.",
                        null
                )
        );
    }
}