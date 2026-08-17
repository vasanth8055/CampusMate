package com.rideloop.tripservice.controller;

import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.sharedkernel.security.AuthenticatedUser;
import com.rideloop.tripservice.dto.request.CreateTripRequest;
import com.rideloop.tripservice.dto.request.UpdateTripRequest;
import com.rideloop.tripservice.dto.response.TripResponse;
import com.rideloop.tripservice.service.interfaces.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(
        name = "Trip APIs",
        description = "APIs for creating, managing, updating and deleting trips in RideLoop."
)
public class TripController {

    private final TripService tripService;

    @Operation(
            summary = "Create a new trip",
            description = "Creates a new trip for the authenticated driver."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<TripResponse>> createTrip(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreateTripRequest request) {

        TripResponse response =
                tripService.createTrip(user.getUserId(), request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Trip created successfully",
                        response
                ));
    }
    @Operation(
            summary = "Search available trips",
            description = "Returns scheduled trips matching route, departure time range and required seats."
    )
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TripResponse>>> searchTrips(
            @AuthenticationPrincipal AuthenticatedUser user,

            @RequestParam(required = false) String source,

            @RequestParam String destination,

            @RequestParam
            @org.springframework.format.annotation.DateTimeFormat(
                    iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME
            )
            java.time.LocalDateTime from,

            @RequestParam
            @org.springframework.format.annotation.DateTimeFormat(
                    iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME
            )
            java.time.LocalDateTime to,

            @RequestParam Integer seats) {

        UUID excludeDriverId = user != null ? user.getUserId() : null;

        List<TripResponse> response =
                tripService.searchTrips(
                        source,
                        destination,
                        from,
                        to,
                        seats,
                        excludeDriverId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Available trips fetched successfully",
                        response
                )
        );
    }

    @Operation(
            summary = "Get trip by ID",
            description = "Returns trip details for the specified trip ID."
    )
    @GetMapping("/{tripId}")
    public ResponseEntity<ApiResponse<TripResponse>> getTripById(
            @PathVariable UUID tripId) {

        TripResponse response = tripService.getTripById(tripId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip fetched successfully",
                        response
                )
        );
    }

    @Operation(
            summary = "Get all trips",
            description = "Returns all available trips."
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<TripResponse>>> getAllTrips() {

        List<TripResponse> response = tripService.getAllTrips();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trips fetched successfully",
                        response
                )
        );
    }

    @Operation(
            summary = "Get my trips",
            description = "Returns all trips created by the authenticated driver."
    )
    @GetMapping({"/me", "/driver"})
    public ResponseEntity<ApiResponse<List<TripResponse>>> getMyTrips(
            @AuthenticationPrincipal AuthenticatedUser user) {

        List<TripResponse> response =
                tripService.getDriverTrips(user.getUserId());

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Driver trips fetched successfully",
                        response
                )
        );
    }

    @Operation(
            summary = "Update trip",
            description = "Updates an existing trip owned by the authenticated driver."
    )
    @PutMapping("/{tripId}")
    public ResponseEntity<ApiResponse<TripResponse>> updateTrip(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody UpdateTripRequest request) {

        TripResponse response =
                tripService.updateTrip(
                        tripId,
                        user.getUserId(),
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip updated successfully",
                        response
                )
        );
    }

    @Operation(
            summary = "Delete trip",
            description = "Deletes a trip owned by the authenticated driver."
    )
    @DeleteMapping("/{tripId}")
    public ResponseEntity<ApiResponse<Void>> deleteTrip(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        tripService.deleteTrip(
                tripId,
                user.getUserId()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip deleted successfully",
                        null
                )
        );
    }
    @RequestMapping(value = "/{tripId}/start", method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<TripResponse>> startTrip(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip started successfully",
                        tripService.startTrip(
                                tripId,
                                user.getUserId()
                        )
                )
        );
    }

    @RequestMapping(value = "/{tripId}/complete", method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<TripResponse>> completeTrip(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip completed successfully",
                        tripService.completeTrip(
                                tripId,
                                user.getUserId()
                        )
                )
        );
    }

    @RequestMapping(value = "/{tripId}/cancel", method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<TripResponse>> cancelTrip(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip cancelled successfully",
                        tripService.cancelTrip(
                                tripId,
                                user.getUserId()
                        )
                )
        );
    }
}