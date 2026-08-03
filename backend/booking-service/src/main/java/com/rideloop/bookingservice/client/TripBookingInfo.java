package com.rideloop.bookingservice.client;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TripBookingInfo(

        UUID tripId,
        UUID driverId,
        Integer availableSeats,
        BigDecimal price,
        String status,
        LocalDateTime departureTime

) {
}