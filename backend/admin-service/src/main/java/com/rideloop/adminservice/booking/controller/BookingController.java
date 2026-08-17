package com.rideloop.adminservice.booking.controller;

import com.rideloop.adminservice.booking.dto.response.BookingResponse;
import com.rideloop.adminservice.booking.service.interfaces.BookingService;
import com.rideloop.sharedkernel.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bookings fetched successfully.",
                        bookingService.getAllBookings()
                )
        );
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingDetails(
            @PathVariable UUID bookingId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Booking details fetched successfully.",
                        bookingService.getBookingDetails(bookingId)
                )
        );
    }
}
