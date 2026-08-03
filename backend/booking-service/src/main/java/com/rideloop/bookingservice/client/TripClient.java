package com.rideloop.bookingservice.client;

import com.rideloop.bookingservice.dto.request.SeatReservationRequest;
import com.rideloop.sharedkernel.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@FeignClient(name = "trip-service")
public interface TripClient {

    @GetMapping("/internal/v1/trips/{tripId}")
    ApiResponse<TripBookingInfo> getTrip(
            @PathVariable("tripId") UUID tripId
    );

    @PostMapping(
            "/internal/v1/trips/{tripId}/seats/reserve"
    )
    ApiResponse<TripBookingInfo> reserveSeats(
            @PathVariable("tripId") UUID tripId,
            @RequestParam("riderId") UUID riderId,
            @RequestBody SeatReservationRequest request
    );

    @PostMapping(
            "/internal/v1/trips/{tripId}/seats/release"
    )
    ApiResponse<TripBookingInfo> releaseSeats(
            @PathVariable("tripId") UUID tripId,
            @RequestBody SeatReservationRequest request
    );
}