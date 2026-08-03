package com.rideloop.ridetrackingservice.dto.request;

import jakarta.validation.constraints.NotNull;

public record LocationUpdateRequest(

        @NotNull
        Double latitude,

        @NotNull
        Double longitude,

        Double speed,

        Double heading,

        Double accuracy
) {
}