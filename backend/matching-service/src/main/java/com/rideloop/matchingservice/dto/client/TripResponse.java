package com.rideloop.matchingservice.dto.client;

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
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}