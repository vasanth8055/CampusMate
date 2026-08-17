package com.rideloop.adminservice.trip.controller;

import com.rideloop.adminservice.trip.dto.response.TripResponse;
import com.rideloop.adminservice.trip.service.interfaces.TripService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TripResponse>>> getAllTrips(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "driverId", required = false) UUID driverId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trips fetched successfully.",
                        tripService.getAllTrips(status, driverId)
                )
        );
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<TripResponse>>> getActiveTrips() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Active trips fetched successfully.",
                        tripService.getActiveTrips()
                )
        );
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<ApiResponse<TripResponse>> getTripDetails(
            @PathVariable UUID tripId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip details fetched successfully.",
                        tripService.getTripDetails(tripId)
                )
        );
    }

    @PatchMapping("/{tripId}/cancel")
    public ResponseEntity<ApiResponse<TripResponse>> cancelTrip(
            @PathVariable UUID tripId,
            @RequestParam(name = "driverId", required = false) UUID driverId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip cancelled successfully.",
                        tripService.cancelTrip(tripId, driverId)
                )
        );
    }
}
