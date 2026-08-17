package com.rideloop.bookingservice.controller;

import com.rideloop.bookingservice.dto.response.BookingResponse;
import com.rideloop.bookingservice.service.interfaces.BookingService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/internal/v1/bookings")
@RequiredArgsConstructor
public class BookingInternalController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<BookingResponse>>> getAllBookings() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bookings fetched successfully",
                        bookingService.getAllBookingsAdmin()
                )
        );
    }

    @GetMapping("/{bookingId}/details")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingAdmin(
            @PathVariable UUID bookingId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking fetched successfully",
                        bookingService.getBookingAdmin(bookingId)
                )
        );
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponse>>
    getBooking(
            @PathVariable UUID bookingId,
            @RequestParam UUID userId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking information fetched successfully",
                        bookingService.getBookingById(
                                bookingId,
                                userId
                        )
                )
        );
    }
}