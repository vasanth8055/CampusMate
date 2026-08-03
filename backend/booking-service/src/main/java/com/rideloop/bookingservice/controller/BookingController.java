package com.rideloop.bookingservice.controller;

import com.rideloop.bookingservice.dto.request.CreateBookingRequest;
import com.rideloop.bookingservice.dto.response.BookingResponse;
import com.rideloop.bookingservice.service.interfaces.BookingService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import com.rideloop.sharedkernel.security.AuthenticatedUser;
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
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(
        name = "Booking APIs",
        description = "RideLoop rider and driver booking operations."
)
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Request a booking")
    public ResponseEntity<ApiResponse<BookingResponse>>
    createBooking(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreateBookingRequest request) {

        BookingResponse response =
                bookingService.createBooking(
                        user.getUserId(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Booking requested successfully",
                                response
                        )
                );
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponse>>
    getBooking(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking fetched successfully",
                        bookingService.getBookingById(
                                bookingId,
                                user.getUserId()
                        )
                )
        );
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<BookingResponse>>>
    getMyBookings(
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bookings fetched successfully",
                        bookingService.getRiderBookings(
                                user.getUserId()
                        )
                )
        );
    }

    @GetMapping("/driver/me")
    public ResponseEntity<ApiResponse<List<BookingResponse>>>
    getDriverBookings(
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Driver bookings fetched successfully",
                        bookingService.getDriverBookings(
                                user.getUserId()
                        )
                )
        );
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>>
    getTripBookings(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trip bookings fetched successfully",
                        bookingService.getTripBookings(
                                tripId,
                                user.getUserId()
                        )
                )
        );
    }

    @PutMapping("/{bookingId}/accept")
    public ResponseEntity<ApiResponse<BookingResponse>>
    acceptBooking(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking accepted successfully",
                        bookingService.acceptBooking(
                                bookingId,
                                user.getUserId()
                        )
                )
        );
    }

    @PutMapping("/{bookingId}/reject")
    public ResponseEntity<ApiResponse<BookingResponse>>
    rejectBooking(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking rejected successfully",
                        bookingService.rejectBooking(
                                bookingId,
                                user.getUserId()
                        )
                )
        );
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>>
    cancelBooking(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking cancelled successfully",
                        bookingService.cancelBooking(
                                bookingId,
                                user.getUserId()
                        )
                )
        );
    }

    @PutMapping("/{bookingId}/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>>
    confirmBooking(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking confirmed successfully",
                        bookingService.confirmBooking(
                                bookingId,
                                user.getUserId()
                        )
                )
        );
    }

    @PutMapping("/{bookingId}/start")
    public ResponseEntity<ApiResponse<BookingResponse>>
    startBooking(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking started successfully",
                        bookingService.startBooking(
                                bookingId,
                                user.getUserId()
                        )
                )
        );
    }

    @PutMapping("/{bookingId}/complete")
    public ResponseEntity<ApiResponse<BookingResponse>>
    completeBooking(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking completed successfully",
                        bookingService.completeBooking(
                                bookingId,
                                user.getUserId()
                        )
                )
        );
    }
}