package com.rideloop.matchingservice.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record MatchRequest(

        @NotBlank
        String source,

        @NotBlank
        String destination,

        @NotNull
        @Future
        LocalDateTime preferredDepartureTime,

        @NotNull
        @Min(1)
        Integer requiredSeats,

        @NotNull
        @Min(0)
        Integer timeToleranceMinutes

) {
}