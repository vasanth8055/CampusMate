package com.rideloop.adminservice.client;

import com.rideloop.adminservice.config.FeignConfig;
import com.rideloop.adminservice.trip.dto.response.TripResponse;
import com.rideloop.sharedkernel.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "trip-service", url = "${trip.service.url:http://trip-service:8082}", configuration = FeignConfig.class)
public interface TripServiceClient {

    @GetMapping("/internal/v1/trips")
    ApiResponse<List<TripResponse>> getAllTrips(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "driverId", required = false) UUID driverId
    );

    @GetMapping("/internal/v1/trips/active")
    ApiResponse<List<TripResponse>> getActiveTrips();

    @GetMapping("/internal/v1/trips/{tripId}/details")
    ApiResponse<TripResponse> getTripDetails(
            @PathVariable("tripId") UUID tripId
    );

    @PatchMapping("/internal/v1/trips/{tripId}/cancel")
    ApiResponse<TripResponse> cancelTrip(
            @PathVariable("tripId") UUID tripId,
            @RequestParam(name = "driverId", required = false) UUID driverId
    );
}
