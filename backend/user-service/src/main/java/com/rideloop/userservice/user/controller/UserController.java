package com.rideloop.userservice.user.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.sharedkernel.security.AuthenticatedUser;
import com.rideloop.userservice.user.dto.ChangePasswordRequest;
import com.rideloop.userservice.user.dto.UpdateUserRequest;
import com.rideloop.userservice.user.dto.UserResponse;
import com.rideloop.userservice.user.service.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private String getIdentifier(AuthenticatedUser user, Authentication authentication) {
        if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
            return user.getEmail();
        }
        if (user != null && user.getUserId() != null) {
            return user.getUserId().toString();
        }
        if (authentication != null && authentication.getName() != null) {
            return authentication.getName();
        }
        throw new IllegalStateException("Unauthenticated user");
    }

    // =========================
    // Current User APIs (Registered first to avoid /{id} capture)
    // =========================

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication) {

        String identifier = getIdentifier(user, authentication);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "User profile fetched successfully.",
                        userService.getCurrentUser(identifier)
                )
        );
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateCurrentUser(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request) {

        String identifier = getIdentifier(user, authentication);
        UserResponse response = userService.updateCurrentUser(
                identifier,
                request
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User profile updated successfully.",
                        response
                )
        );
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteCurrentUser(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication) {

        String identifier = getIdentifier(user, authentication);
        userService.deleteCurrentUser(identifier);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User deleted successfully.",
                        null
                )
        );
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        String identifier = getIdentifier(user, authentication);
        userService.changePassword(identifier, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password changed successfully.",
                        null
                )
        );
    }

    // =========================
    // Admin / Lookup APIs
    // =========================

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Users fetched successfully.",
                        userService.getAllUsers()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "User fetched successfully.",
                        userService.getUserById(id)
                )
        );
    }
}