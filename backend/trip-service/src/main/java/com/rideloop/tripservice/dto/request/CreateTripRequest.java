package com.rideloop.tripservice.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateTripRequest(

        @NotBlank
        String source,

        Double sourceLatitude,

        Double sourceLongitude,

        @NotBlank
        String destination,

        Double destinationLatitude,

        Double destinationLongitude,

        @NotNull
        @Future
        LocalDateTime departureTime,

        LocalDateTime arrivalTime,

        @NotNull
        @Min(1)
        Integer availableSeats,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal price

) {
}