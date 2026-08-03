package com.rideloop.tripservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SeatReservationRequest(

        @NotNull(message = "Seat count is required")
        @Min(value = 1, message = "Seat count must be at least 1")
        Integer seats

) {
}