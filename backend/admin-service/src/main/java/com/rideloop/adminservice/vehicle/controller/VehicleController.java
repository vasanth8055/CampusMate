package com.rideloop.adminservice.vehicle.controller;

import com.rideloop.adminservice.driver.dto.response.VehicleResponse;
import com.rideloop.adminservice.vehicle.service.interfaces.VehicleService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAllVehicles() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicles fetched successfully.",
                        vehicleService.getAllVehicles()
                )
        );
    }

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
