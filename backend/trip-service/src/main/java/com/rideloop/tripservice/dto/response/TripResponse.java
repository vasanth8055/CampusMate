package com.rideloop.tripservice.dto.response;

import com.rideloop.tripservice.enums.TripStatus;

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

        TripStatus status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt,

        DriverInfoResponse driver,

        VehicleResponse vehicle

) {
}