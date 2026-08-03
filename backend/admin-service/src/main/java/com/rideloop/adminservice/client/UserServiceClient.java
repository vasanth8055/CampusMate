package com.rideloop.adminservice.client;

import com.rideloop.adminservice.driver.dto.response.DriverResponse;
import com.rideloop.adminservice.user.dto.response.UserResponse;
import com.rideloop.sharedkernel.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
@FeignClient(name = "user-service")
public interface UserServiceClient {

    // Driver

    @GetMapping("/api/v1/internal/drivers/pending")
    ApiResponse<List<DriverResponse>> getPendingDrivers();

    @GetMapping("/api/v1/internal/drivers/{driverId}")
    ApiResponse<DriverResponse> getDriver(
            @PathVariable UUID driverId
    );

    @PatchMapping("/api/v1/internal/drivers/{driverId}/approve")
    ApiResponse<Void> approveDriver(
            @PathVariable UUID driverId
    );

    @PatchMapping("/api/v1/internal/drivers/{driverId}/reject")
    ApiResponse<Void> rejectDriver(
            @PathVariable UUID driverId
    );

    // User

    @GetMapping("/api/v1/internal/users")
    ApiResponse<List<UserResponse>> getUsers();

    @GetMapping("/api/v1/internal/users/{userId}")
    ApiResponse<UserResponse> getUser(
            @PathVariable UUID userId
    );

    @PatchMapping("/api/v1/internal/users/{userId}/block")
    ApiResponse<Void> blockUser(
            @PathVariable UUID userId
    );

    @PatchMapping("/api/v1/internal/users/{userId}/unblock")
    ApiResponse<Void> unblockUser(
            @PathVariable UUID userId
    );
}