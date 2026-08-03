package com.rideloop.bookingservice.dto.response;

import com.rideloop.bookingservice.entity.enums.BookingStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record BookingResponse(

        UUID id,

        UUID tripId,

        UUID riderId,

        UUID driverId,

        Integer requestedSeats,

        BookingStatus status,

        LocalDateTime bookingTime,

        LocalDateTime acceptedAt,

        LocalDateTime rejectedAt,

        LocalDateTime cancelledAt,

        LocalDateTime confirmedAt,

        LocalDateTime startedAt,

        LocalDateTime completedAt,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}