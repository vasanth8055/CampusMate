package com.rideloop.adminservice.user.controller;

import com.rideloop.adminservice.user.dto.response.UserResponse;
import com.rideloop.adminservice.user.service.interfaces.UserService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Users fetched successfully.",
                        userService.getUsers()
                )
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User fetched successfully.",
                        userService.getUser(userId)
                )
        );
    }

    @PatchMapping("/{userId}/block")
    public ResponseEntity<ApiResponse<Void>> blockUser(
            @PathVariable UUID userId) {

        userService.blockUser(userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User blocked successfully.",
                        null
                )
        );
    }

    @PatchMapping("/{userId}/unblock")
    public ResponseEntity<ApiResponse<Void>> unblockUser(
            @PathVariable UUID userId) {

        userService.unblockUser(userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User unblocked successfully.",
                        null
                )
        );
    }

    @PostMapping("/{userId}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable UUID userId,
            @RequestParam(name = "newPassword", required = false) String newPassword) {

        userService.resetPassword(userId, newPassword);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User password reset successfully.",
                        null
                )
        );
    }
}