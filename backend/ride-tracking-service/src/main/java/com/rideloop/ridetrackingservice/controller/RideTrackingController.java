package com.rideloop.ridetrackingservice.controller;

import com.rideloop.ridetrackingservice.dto.request.LocationUpdateRequest;
import com.rideloop.ridetrackingservice.dto.response.RideLocationResponse;
import com.rideloop.sharedkernel.security.AuthenticatedUser;
import com.rideloop.ridetrackingservice.service.interfaces.RideTrackingService;
import com.rideloop.sharedkernel.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
public class RideTrackingController {

    private final RideTrackingService rideTrackingService;

    @PostMapping("/{tripId}/location")
    public ApiResponse<RideLocationResponse> updateLocation(
            @AuthenticationPrincipal
            AuthenticatedUser user,
            @PathVariable UUID tripId,
            @Valid @RequestBody
            LocationUpdateRequest request) {

        return ApiResponse.success(
                "Location updated successfully",
                rideTrackingService.updateLocation(
                        user.getUserId(),
                        tripId,
                        request
                )
        );
    }

    @GetMapping("/{tripId}/latest")
    public ApiResponse<RideLocationResponse> getLatestLocation(
            @PathVariable UUID tripId) {

        return ApiResponse.success(
                "Latest location fetched successfully",
                rideTrackingService.getLatestLocation(
                        tripId
                )
        );
    }

    @GetMapping("/{tripId}/history")
    public ApiResponse<List<RideLocationResponse>> getRideHistory(
            @PathVariable UUID tripId) {

        return ApiResponse.success(
                "Ride history fetched successfully",
                rideTrackingService.getRideHistory(
                        tripId
                )
        );
    }
}