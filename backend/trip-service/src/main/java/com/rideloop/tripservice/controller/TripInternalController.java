package com.rideloop.tripservice.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.tripservice.dto.request.SeatReservationRequest;
import com.rideloop.tripservice.dto.response.TripBookingInfoResponse;
import com.rideloop.tripservice.dto.response.TripResponse;
import com.rideloop.tripservice.dto.response.TripTrackingInfoResponse;
import com.rideloop.tripservice.service.interfaces.TripInventoryService;
import com.rideloop.tripservice.service.interfaces.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.rideloop.tripservice.dto.response.TripResponse;
import com.rideloop.tripservice.service.interfaces.TripService;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;
@RestController
@RequestMapping("/internal/v1/trips")
@RequiredArgsConstructor
public class TripInternalController {

    private final TripInventoryService tripInventoryService;
    private final TripService tripService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TripResponse>>> getAllTrips(
            @RequestParam(required = false) com.rideloop.tripservice.enums.TripStatus status,
            @RequestParam(required = false) UUID driverId) {

        List<TripResponse> trips = tripService.getAllTrips();
        if (status != null) {
            trips = trips.stream().filter(t -> t.status() == status).toList();
        }
        if (driverId != null) {
            trips = trips.stream().filter(t -> t.driverId().equals(driverId)).toList();
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trips fetched successfully",
                        trips
                )
        );
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<TripResponse>>> getActiveTrips() {
        List<TripResponse> trips = tripService.getAllTrips().stream()
                .filter(t -> t.status() == com.rideloop.tripservice.enums.TripStatus.IN_PROGRESS ||
                             t.status() == com.rideloop.tripservice.enums.TripStatus.SCHEDULED)
                .toList();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Active trips fetched successfully",
                        trips
                )
        );
    }

    @GetMapping("/{tripId}/details")
    public ResponseEntity<ApiResponse<TripResponse>> getTripDetails(
            @PathVariable UUID tripId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip details fetched successfully",
                        tripService.getTripById(tripId)
                )
        );
    }

    @PatchMapping("/{tripId}/cancel")
    public ResponseEntity<ApiResponse<TripResponse>> cancelTrip(
            @PathVariable UUID tripId,
            @RequestParam(required = false) UUID driverId) {

        TripResponse trip = tripService.getTripById(tripId);
        UUID targetDriverId = driverId != null ? driverId : trip.driverId();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip cancelled successfully",
                        tripService.cancelTrip(tripId, targetDriverId)
                )
        );
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<ApiResponse<TripBookingInfoResponse>>
    getBookingInfo(
            @PathVariable UUID tripId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip booking information fetched successfully",
                        tripInventoryService.getBookingInfo(tripId)
                )
        );
    }

    @PostMapping("/{tripId}/seats/reserve")
    public ResponseEntity<ApiResponse<TripBookingInfoResponse>>
    reserveSeats(
            @PathVariable UUID tripId,
            @RequestParam UUID riderId,
            @Valid @RequestBody SeatReservationRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Seats reserved successfully",
                        tripInventoryService.reserveSeats(
                                tripId,
                                riderId,
                                request.seats()
                        )
                )
        );
    }

    @PostMapping("/{tripId}/seats/release")
    public ResponseEntity<ApiResponse<TripBookingInfoResponse>>
    releaseSeats(
            @PathVariable UUID tripId,
            @Valid @RequestBody SeatReservationRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Seats released successfully",
                        tripInventoryService.releaseSeats(
                                tripId,
                                request.seats()
                        )
                )
        );
    }
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TripResponse>>> searchAvailableTrips(
            @RequestParam(required = false) String source,
            @RequestParam String destination,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime from,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime to,
            @RequestParam Integer seats) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Available trips fetched successfully",
                        tripService.searchTrips(
                                source,
                                destination,
                                from,
                                to,
                                seats
                        )
                )
        );
    }
    @GetMapping("/{tripId}/tracking")
    public ResponseEntity<ApiResponse<TripTrackingInfoResponse>>
    getTrackingInfo(
            @PathVariable UUID tripId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip tracking information fetched successfully",
                        tripService.getTrackingInfo(tripId)
                )
        );
    }
}