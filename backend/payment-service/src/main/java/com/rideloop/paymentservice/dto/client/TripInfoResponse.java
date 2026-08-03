package com.rideloop.paymentservice.dto.client;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TripInfoResponse(

        UUID tripId,
        UUID driverId,
        Integer availableSeats,
        BigDecimal price,
        String status,
        LocalDateTime departureTime

) {
}