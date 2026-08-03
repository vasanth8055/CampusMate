package com.rideloop.bookingservice.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateBookingRequest(

        @NotNull(message = "Trip ID is required")
        UUID tripId,

        @NotNull(message = "Requested seats are required")
        @Min(
                value = 1,
                message = "At least one seat must be requested"
        )
        @Max(
                value = 8,
                message = "Cannot request more than 8 seats"
        )
        Integer requestedSeats

) {
}