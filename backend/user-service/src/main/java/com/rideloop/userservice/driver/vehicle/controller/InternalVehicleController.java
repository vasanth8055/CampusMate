package com.rideloop.userservice.driver.vehicle.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.userservice.driver.vehicle.dto.response.VehicleResponse;
import com.rideloop.userservice.driver.vehicle.service.interfaces.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/internal/vehicles")
@RequiredArgsConstructor
@Tag(
        name = "Internal Vehicle APIs",
        description = "Internal APIs used by other RideLoop services."
)
public class InternalVehicleController {

    private final VehicleService vehicleService;

    @Operation(summary = "Get all vehicles")
    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<VehicleResponse>>> getAllVehicles() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicles fetched successfully.",
                        vehicleService.getAllVehiclesAdmin()
                )
        );
    }

    @Operation(summary = "Get vehicle by driver ID")
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleByDriver(
            @PathVariable UUID driverId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicle fetched successfully.",
                        vehicleService.getVehicleByDriver(driverId)
                )
        );
    }

    @Operation(summary = "Get vehicle by ID")
    @GetMapping("/{vehicleId}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicle(
            @PathVariable UUID vehicleId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicle fetched successfully.",
                        vehicleService.getVehicle(vehicleId)
                )
        );
    }

    @Operation(summary = "Approve vehicle")
    @PatchMapping("/{vehicleId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveVehicle(
            @PathVariable UUID vehicleId) {

        vehicleService.approveVehicle(vehicleId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicle approved successfully.",
                        null
                )
        );
    }

    @Operation(summary = "Deactivate vehicle")
    @PatchMapping("/{vehicleId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateVehicle(
            @PathVariable UUID vehicleId) {

        vehicleService.deactivateVehicle(vehicleId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicle deactivated successfully.",
                        null
                )
        );
    }

    @Operation(summary = "Reactivate vehicle")
    @PatchMapping("/{vehicleId}/reactivate")
    public ResponseEntity<ApiResponse<Void>> reactivateVehicle(
            @PathVariable UUID vehicleId) {

        vehicleService.reactivateVehicle(vehicleId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicle reactivated successfully.",
                        null
                )
        );
    }
}