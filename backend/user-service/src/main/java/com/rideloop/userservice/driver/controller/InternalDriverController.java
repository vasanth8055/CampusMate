package com.rideloop.userservice.driver.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.userservice.driver.dto.response.DriverResponse;
import com.rideloop.userservice.driver.service.interfaces.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/internal/drivers")
@RequiredArgsConstructor
@jakarta.annotation.security.PermitAll
public class InternalDriverController {

    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAllDrivers(
            @RequestParam(required = false) com.rideloop.userservice.driver.entity.enums.DriverStatus status) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Drivers fetched successfully.",
                        driverService.getAllDrivers(status)
                )
        );
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getPendingDrivers() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Pending drivers fetched successfully.",
                        driverService.getPendingDrivers()
                )
        );
    }

    @GetMapping("/{driverId}")
    public ResponseEntity<ApiResponse<DriverResponse>> getDriver(
            @PathVariable UUID driverId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Driver fetched successfully.",
                        driverService.getDriver(driverId)
                )
        );
    }

    @PatchMapping("/{driverId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveDriver(
            @PathVariable UUID driverId) {

        driverService.approveDriver(driverId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Driver approved successfully.",
                        null
                )
        );
    }

    @PatchMapping("/{driverId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectDriver(
            @PathVariable UUID driverId,
            @RequestParam(name = "reason", required = false) String reason) {

        if (reason != null && !reason.isBlank()) {
            driverService.rejectDriver(driverId, reason);
        } else {
            driverService.rejectDriver(driverId);
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Driver rejected successfully.",
                        null
                )
        );
    }

    @PatchMapping("/{driverId}/suspend")
    public ResponseEntity<ApiResponse<Void>> suspendDriver(
            @PathVariable UUID driverId,
            @RequestParam(name = "reason", required = false) String reason) {

        driverService.suspendDriver(driverId, reason);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Driver suspended successfully.",
                        null
                )
        );
    }

    @PatchMapping("/{driverId}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreDriver(
            @PathVariable UUID driverId) {

        driverService.restoreDriver(driverId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Driver restored successfully.",
                        null
                )
        );
    }

    @GetMapping("/{driverId}/approved")
    public ResponseEntity<ApiResponse<Boolean>> isDriverApproved(
            @PathVariable UUID driverId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Driver status fetched successfully.",
                        driverService.isDriverApproved(driverId)
                )
        );
    }
}