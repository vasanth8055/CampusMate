package com.rideloop.userservice.driver.vehicle.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.sharedkernel.security.AuthenticatedUser;
import com.rideloop.userservice.driver.vehicle.dto.request.CreateVehicleRequest;
import com.rideloop.userservice.driver.vehicle.dto.request.UpdateVehicleRequest;
import com.rideloop.userservice.driver.vehicle.dto.response.VehicleResponse;
import com.rideloop.userservice.driver.vehicle.service.interfaces.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/driver/vehicle")
@RequiredArgsConstructor
@Tag(
        name = "Vehicle APIs",
        description = "Vehicle management APIs for approved drivers."
)
public class VehicleController {

    private final VehicleService vehicleService;

    private String getIdentifier(AuthenticatedUser user, Authentication authentication) {
        if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
            return user.getEmail();
        }
        if (user != null && user.getUserId() != null) {
            return user.getUserId().toString();
        }
        if (authentication != null && authentication.getName() != null) {
            return authentication.getName();
        }
        throw new IllegalStateException("Unauthenticated user");
    }

    @Operation(summary = "Register Vehicle")
    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> registerVehicle(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication,
            @Valid @RequestBody CreateVehicleRequest request) {

        String identifier = getIdentifier(user, authentication);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicle registered successfully.",
                        vehicleService.registerVehicle(
                                identifier,
                                request
                        )
                )
        );
    }

    @Operation(summary = "Get My Active Vehicle")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<VehicleResponse>> getMyVehicle(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication) {

        String identifier = getIdentifier(user, authentication);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicle fetched successfully.",
                        vehicleService.getMyVehicle(
                                identifier
                        )
                )
        );
    }

    @Operation(summary = "Get All Driver's Vehicles")
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAllVehicles(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication) {

        String identifier = getIdentifier(user, authentication);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicles fetched successfully.",
                        vehicleService.getAllVehicles(
                                identifier
                        )
                )
        );
    }

    @Operation(summary = "Activate Specific Vehicle")
    @PutMapping("/{vehicleId}/activate")
    public ResponseEntity<ApiResponse<VehicleResponse>> activateVehicle(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication,
            @PathVariable UUID vehicleId) {

        String identifier = getIdentifier(user, authentication);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicle activated successfully.",
                        vehicleService.activateVehicle(
                                identifier,
                                vehicleId
                        )
                )
        );
    }

    @Operation(summary = "Update Vehicle")
    @PutMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication,
            @Valid @RequestBody UpdateVehicleRequest request) {

        String identifier = getIdentifier(user, authentication);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicle updated successfully.",
                        vehicleService.updateVehicle(
                                identifier,
                                request
                        )
                )
        );
    }

    @Operation(summary = "Upload RC Image")
    @PostMapping("/rc")
    public ResponseEntity<ApiResponse<Void>> uploadRcImage(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {

        String identifier = getIdentifier(user, authentication);
        vehicleService.uploadRcImage(
                identifier,
                file
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "RC uploaded successfully.",
                        null
                )
        );
    }

    @Operation(summary = "Delete Vehicle")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            @AuthenticationPrincipal AuthenticatedUser user,
            Authentication authentication) {

        String identifier = getIdentifier(user, authentication);
        vehicleService.deleteVehicle(
                identifier
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Vehicle deleted successfully.",
                        null
                )
        );
    }
}