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
public class InternalDriverController {

    private final DriverService driverService;

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
            @PathVariable UUID driverId) {

        driverService.rejectDriver(driverId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Driver rejected successfully.",
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