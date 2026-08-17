package com.rideloop.adminservice.client;

import com.rideloop.adminservice.config.FeignConfig;
import com.rideloop.adminservice.driver.dto.response.DriverResponse;
import com.rideloop.adminservice.driver.dto.response.VehicleResponse;
import com.rideloop.adminservice.user.dto.response.UserResponse;
import com.rideloop.sharedkernel.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "user-service", url = "${user.service.url:http://user-service:8081}", configuration = FeignConfig.class)
public interface UserServiceClient {

    // Driver APIs

    @GetMapping("/api/v1/internal/drivers")
    ApiResponse<List<DriverResponse>> getAllDrivers(
            @RequestParam(name = "status", required = false) String status
    );

    @GetMapping("/api/v1/internal/drivers/pending")
    ApiResponse<List<DriverResponse>> getPendingDrivers();

    @GetMapping("/api/v1/internal/drivers/{driverId}")
    ApiResponse<DriverResponse> getDriver(
            @PathVariable("driverId") UUID driverId
    );

    @PatchMapping("/api/v1/internal/drivers/{driverId}/approve")
    ApiResponse<Void> approveDriver(
            @PathVariable("driverId") UUID driverId
    );

    @PatchMapping("/api/v1/internal/drivers/{driverId}/reject")
    ApiResponse<Void> rejectDriver(
            @PathVariable("driverId") UUID driverId,
            @RequestParam(name = "reason", required = false) String reason
    );

    @PatchMapping("/api/v1/internal/drivers/{driverId}/suspend")
    ApiResponse<Void> suspendDriver(
            @PathVariable("driverId") UUID driverId,
            @RequestParam(name = "reason", required = false) String reason
    );

    @PatchMapping("/api/v1/internal/drivers/{driverId}/restore")
    ApiResponse<Void> restoreDriver(
            @PathVariable("driverId") UUID driverId
    );

    // Vehicle APIs

    @GetMapping("/api/v1/internal/vehicles")
    ApiResponse<List<VehicleResponse>> getAllVehicles();

    @GetMapping("/api/v1/internal/vehicles/{vehicleId}")
    ApiResponse<VehicleResponse> getVehicle(
            @PathVariable("vehicleId") UUID vehicleId
    );

    @PatchMapping("/api/v1/internal/vehicles/{vehicleId}/approve")
    ApiResponse<Void> approveVehicle(
            @PathVariable("vehicleId") UUID vehicleId
    );

    @PatchMapping("/api/v1/internal/vehicles/{vehicleId}/deactivate")
    ApiResponse<Void> deactivateVehicle(
            @PathVariable("vehicleId") UUID vehicleId
    );

    @PatchMapping("/api/v1/internal/vehicles/{vehicleId}/reactivate")
    ApiResponse<Void> reactivateVehicle(
            @PathVariable("vehicleId") UUID vehicleId
    );

    // User APIs

    @GetMapping("/api/v1/internal/users")
    ApiResponse<List<UserResponse>> getUsers();

    @GetMapping("/api/v1/internal/users/{userId}")
    ApiResponse<UserResponse> getUser(
            @PathVariable("userId") UUID userId
    );

    @PatchMapping("/api/v1/internal/users/{userId}/block")
    ApiResponse<Void> blockUser(
            @PathVariable("userId") UUID userId
    );

    @PatchMapping("/api/v1/internal/users/{userId}/unblock")
    ApiResponse<Void> unblockUser(
            @PathVariable("userId") UUID userId
    );

    @PostMapping("/api/v1/internal/users/{userId}/reset-password")
    ApiResponse<Void> resetPassword(
            @PathVariable("userId") UUID userId,
            @RequestParam(name = "newPassword", required = false) String newPassword
    );
}