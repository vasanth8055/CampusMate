package com.rideloop.userservice.user.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.userservice.user.dto.UserResponse;
import com.rideloop.userservice.user.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Users fetched successfully.",
                        userService.getAllUsers()
                )
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User fetched successfully.",
                        userService.getUserById(userId)
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
}