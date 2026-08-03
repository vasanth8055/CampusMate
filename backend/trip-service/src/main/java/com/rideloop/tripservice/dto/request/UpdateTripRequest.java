package com.rideloop.tripservice.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UpdateTripRequest(

        @NotBlank
        String source,

        @NotBlank
        String destination,

        @Future
        LocalDateTime departureTime,

        LocalDateTime arrivalTime,

        @Min(1)
        Integer availableSeats,

        @DecimalMin("0.0")
        BigDecimal price

) {
}