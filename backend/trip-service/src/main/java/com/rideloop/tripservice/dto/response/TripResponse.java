package com.rideloop.tripservice.dto.response;

import com.rideloop.tripservice.enums.TripStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TripResponse(

        UUID id,

        UUID driverId,

        String source,

        String destination,

        LocalDateTime departureTime,

        LocalDateTime arrivalTime,

        Integer availableSeats,

        BigDecimal price,

        TripStatus status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}