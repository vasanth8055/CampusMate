package com.rideloop.adminservice.driver.controller;

import com.rideloop.adminservice.driver.dto.response.DriverResponse;
import com.rideloop.adminservice.driver.service.interfaces.DriverService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAllDrivers(
            @RequestParam(name = "status", required = false) String status) {

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
}