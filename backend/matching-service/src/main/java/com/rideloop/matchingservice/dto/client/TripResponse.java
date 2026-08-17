package com.rideloop.matchingservice.dto.client;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TripResponse(

        UUID id,
        UUID driverId,
        String source,
        Double sourceLatitude,
        Double sourceLongitude,
        String destination,
        Double destinationLatitude,
        Double destinationLongitude,
        LocalDateTime departureTime,
        LocalDateTime arrivalTime,
        Integer availableSeats,
        BigDecimal price,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}