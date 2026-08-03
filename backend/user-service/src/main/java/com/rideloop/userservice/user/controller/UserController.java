package com.rideloop.userservice.user.controller;

import com.rideloop.userservice.user.dto.ChangePasswordRequest;
import com.rideloop.userservice.user.dto.UpdateUserRequest;
import com.rideloop.userservice.user.dto.UserResponse;
import com.rideloop.userservice.user.service.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // =========================
    // Admin APIs
    // =========================

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // =========================
    // Current User APIs
    // =========================

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {

        return ResponseEntity.ok(
                userService.getCurrentUser(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request) {

        UserResponse response = userService.updateCurrentUser(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteCurrentUser(Authentication authentication) {

        userService.deleteCurrentUser(authentication.getName());

        return ResponseEntity.noContent().build();
    }
    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(authentication.getName(), request);

        return ResponseEntity.noContent().build();
    }
}