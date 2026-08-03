package com.rideloop.tripservice.dto.response;

import com.rideloop.tripservice.enums.TripStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TripBookingInfoResponse(

        UUID tripId,
        UUID driverId,
        Integer availableSeats,
        BigDecimal price,
        TripStatus status,
        LocalDateTime departureTime

) {
}